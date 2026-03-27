import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_BASE_URL = 'https://www.hollandsevelden.nl';
const DEFAULT_SEASON = '2025-2026';
const DEFAULT_CONCURRENCY = 8;
const SNAPSHOT_VERSION = 1;

type MatchdayType = 'za' | 'zo' | null;

interface SeedOptions {
  baseUrl: string;
  season: string;
  dryRun: boolean;
  wipeExisting: boolean;
  refresh: boolean;
  concurrency: number;
  maxLeagues?: number;
  snapshotPath: string;
}

interface ClubSeedRecord {
  name: string;
  clubUrl: string | null;
  logoUrl: string | null;
  city: string | null;
  region: string | null;
  stadium: string | null;
  streetAddress: string | null;
  postalCode: string | null;
  parentClubName?: string | null;
}

interface CompetitionSeedRecord {
  path: string;
  competitionLabel: string;
  regionLabel: string;
  matchdayType: 'saturday' | 'sunday' | 'mixed';
  tier: number;
  clubs: ClubSeedRecord[];
}

interface CompetitionScrapeFailure {
  path: string;
  reason: string;
}

interface LocationSeedRecord {
  locationId: string;
  prefix: string | null;
  stadium: string | null;
  city: string | null;
  region: string | null;
  streetAddress: string | null;
  postalCode: string | null;
}

interface TeamSeedInternal {
  teamId: string | null;
  prefix: string | null;
  name: string;
  clubUrl: string | null;
  logoUrl: string | null;
  city: string | null;
  region: string | null;
  stadium: string | null;
  streetAddress: string | null;
  postalCode: string | null;
}

interface SnapshotFile {
  version: number;
  generatedAt: string;
  source: {
    season: string;
    baseUrl: string;
  };
  totals: {
    leagues: number;
    clubs: number;
    withCity: number;
    withStadium: number;
  };
  records: CompetitionSeedRecord[];
}

interface O21ClubSeed {
  name: string;
  city: string;
  parentClubName: string;
}

const O21_COMPETITIONS: Array<{
  competitionLabel: string;
  tier: number;
  suffix: string;
  clubs: O21ClubSeed[];
}> = [
  {
    competitionLabel: 'O21 Divisie 1',
    tier: 11,
    suffix: 'divisie-1',
    clubs: [
      { name: 'Feyenoord Onder 21', city: 'Rotterdam', parentClubName: 'Feyenoord' },
      { name: 'SC Cambuur Onder 21', city: 'Leeuwarden', parentClubName: 'SC Cambuur' },
      { name: 'FC Twente/Heracles Onder 21', city: 'Enschede', parentClubName: 'FC Twente' },
      { name: 'PEC Zwolle Onder 21', city: 'Zwolle', parentClubName: 'PEC Zwolle' },
      { name: 'Go Ahead Eagles Onder 21', city: 'Deventer', parentClubName: 'Go Ahead Eagles' },
      { name: 'FC Groningen Onder 21', city: 'Groningen', parentClubName: 'FC Groningen' },
      { name: 'Willem II Onder 21', city: 'Tilburg', parentClubName: 'Willem II' },
      { name: 'De Graafschap Onder 21', city: 'Doetinchem', parentClubName: 'De Graafschap' }
    ]
  },
  {
    competitionLabel: 'O21 Divisie 2',
    tier: 12,
    suffix: 'divisie-2',
    clubs: [
      { name: 'Excelsior Onder 21', city: 'Rotterdam', parentClubName: 'Excelsior' },
      { name: 'Helmond Sport Onder 21', city: 'Helmond', parentClubName: 'Helmond Sport' },
      { name: 'FC Dordrecht Onder 21', city: 'Dordrecht', parentClubName: 'FC Dordrecht' },
      { name: 'Roda JC Onder 21', city: 'Kerkrade', parentClubName: 'Roda JC Kerkrade' },
      { name: 'FC Den Bosch Onder 21', city: 'Den Bosch', parentClubName: 'FC Den Bosch' },
      { name: 'Almere City Onder 21', city: 'Almere', parentClubName: 'Almere City FC' },
      { name: 'MVV Maastricht Onder 21', city: 'Maastricht', parentClubName: 'MVV Maastricht' },
      { name: 'ADO Den Haag Onder 21', city: 'Den Haag', parentClubName: 'ADO Den Haag' }
    ]
  },
  {
    competitionLabel: 'O21 Divisie 3',
    tier: 13,
    suffix: 'divisie-3',
    clubs: [
      { name: 'FC Volendam Onder 21', city: 'Volendam', parentClubName: 'FC Volendam' },
      { name: 'TOP Oss Onder 21', city: 'Oss', parentClubName: 'TOP Oss' },
      { name: 'SC Telstar Onder 21', city: 'Velsen', parentClubName: 'Telstar' },
      { name: 'FC Eindhoven Onder 21', city: 'Eindhoven', parentClubName: 'FC Eindhoven' },
      { name: 'FC Emmen Onder 21', city: 'Emmen', parentClubName: 'FC Emmen' },
      { name: 'FC Utrecht Onder 21', city: 'Utrecht', parentClubName: 'FC Utrecht' },
      { name: 'NAC Breda Onder 21', city: 'Breda', parentClubName: 'NAC Breda' },
      { name: 'NEC Nijmegen Onder 21', city: 'Nijmegen', parentClubName: 'NEC Nijmegen' }
    ]
  },
  {
    competitionLabel: 'O21 Divisie 4A',
    tier: 14,
    suffix: 'divisie-4a',
    clubs: [
      { name: 'VVV-Venlo Onder 21', city: 'Venlo', parentClubName: 'VVV-Venlo' },
      { name: 'AZ Onder 21', city: 'Alkmaar', parentClubName: 'AZ' },
      { name: 'Ajax Onder 21', city: 'Amsterdam', parentClubName: 'Ajax' },
      { name: 'PSV Onder 21', city: 'Eindhoven', parentClubName: 'PSV' },
      { name: 'Sparta Rotterdam Onder 21', city: 'Rotterdam', parentClubName: 'Sparta Rotterdam' },
      { name: 'Fortuna Sittard Onder 21', city: 'Sittard', parentClubName: 'Fortuna Sittard' },
      { name: 'Heracles Almelo Onder 21', city: 'Almelo', parentClubName: 'Heracles Almelo' },
      { name: 'RKC Waalwijk Onder 21', city: 'Waalwijk', parentClubName: 'RKC Waalwijk' }
    ]
  },
  {
    competitionLabel: 'O21 Divisie 4B',
    tier: 14,
    suffix: 'divisie-4b',
    clubs: [
      { name: 'SC Heerenveen Onder 21', city: 'Heerenveen', parentClubName: 'SC Heerenveen' },
      { name: 'AFC Onder 21', city: 'Amsterdam', parentClubName: 'AFC' },
      { name: 'HHC Hardenberg Onder 21', city: 'Hardenberg', parentClubName: 'HHC Hardenberg' },
      { name: 'Zeeburgia Onder 21', city: 'Amsterdam', parentClubName: 'Zeeburgia' },
      { name: 'Kon. HFC Onder 21', city: 'Haarlem', parentClubName: 'Kon. HFC' },
      { name: 'DEM Onder 21', city: 'Beverwijk', parentClubName: 'DEM' },
      { name: 'Quick Boys Onder 21', city: 'Katwijk', parentClubName: 'Quick Boys' },
      { name: 'Westlandia Onder 21', city: 'Naaldwijk', parentClubName: 'Westlandia' }
    ]
  }
];

function defaultSnapshotPath(season: string): string {
  return path.join(__dirname, '..', 'data', `hollandsevelden-men-${season}.json`);
}

function parseArgs(argv: string[]): SeedOptions {
  let season = DEFAULT_SEASON;
  let baseUrl = DEFAULT_BASE_URL;
  let dryRun = false;
  let wipeExisting = true;
  let refresh = false;
  let concurrency = DEFAULT_CONCURRENCY;
  let maxLeagues: number | undefined;
  let snapshotPath: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '--keep-existing') {
      wipeExisting = false;
      continue;
    }

    if (arg === '--refresh') {
      refresh = true;
      continue;
    }

    if (arg === '--season' && next) {
      season = next.trim();
      index += 1;
      continue;
    }

    if (arg === '--base-url' && next) {
      baseUrl = next.trim().replace(/\/+$/, '');
      index += 1;
      continue;
    }

    if (arg === '--concurrency' && next) {
      const parsed = Number(next);
      if (Number.isFinite(parsed) && parsed > 0) {
        concurrency = Math.max(1, Math.floor(parsed));
      }
      index += 1;
      continue;
    }

    if (arg === '--max-leagues' && next) {
      const parsed = Number(next);
      if (Number.isFinite(parsed) && parsed > 0) {
        maxLeagues = Math.max(1, Math.floor(parsed));
      }
      index += 1;
      continue;
    }

    if (arg === '--snapshot' && next) {
      snapshotPath = next.trim();
      index += 1;
      continue;
    }
  }

  const resolvedSnapshot = snapshotPath
    ? path.isAbsolute(snapshotPath)
      ? snapshotPath
      : path.resolve(process.cwd(), snapshotPath)
    : defaultSnapshotPath(season);

  return {
    baseUrl,
    season,
    dryRun,
    wipeExisting,
    refresh,
    concurrency,
    maxLeagues,
    snapshotPath: resolvedSnapshot
  };
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num: string) => String.fromCodePoint(parseInt(num, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&apos;/g, '\'')
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'e')
    .replace(/&ouml;/g, 'o')
    .replace(/&uuml;/g, 'u')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeWhitespace(input: string): string {
  return decodeHtmlEntities(input).replace(/\s+/g, ' ').trim();
}

function slugToTitleCase(input: string): string {
  const spaced = input.replace(/-/g, ' ').trim();
  if (!spaced) {
    return input;
  }

  if (spaced.startsWith('s ')) {
    const rest = spaced.slice(2);
    const converted = rest
      .split(' ')
      .filter(Boolean)
      .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
      .join(' ');
    return `'s ${converted}`;
  }

  return spaced
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function clubNameKey(name: string): string {
  return normalizeWhitespace(name).toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const value = normalizeWhitespace(raw);
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }

  return result;
}

function normalizeCompetitionPath(pathValue: string, season: string): string | null {
  const decoded = decodeHtmlEntities(pathValue).split('#')[0].split('?')[0].trim();
  if (!decoded.startsWith(`/competities/${season}/`)) {
    return null;
  }

  if (!decoded.endsWith('/')) {
    return `${decoded}/`;
  }

  return decoded;
}

function extractCompetitionPaths(indexHtml: string, season: string): string[] {
  const hrefPattern = /href="([^"]+)"/g;
  const links = new Set<string>();

  const regionalLeaf = new RegExp(
    `^/competities/${season}/(?:west-1|west-2|zuid-1|zuid-2|oost|noord)/(?:za|zo)/[^/]+/$`
  );
  const nationalLeaf = new RegExp(`^/competities/${season}/landelijk/[^/]+/$`);

  for (const match of indexHtml.matchAll(hrefPattern)) {
    const normalized = normalizeCompetitionPath(match[1], season);
    if (!normalized) {
      continue;
    }

    if (normalized.includes('/vrouwen/')) {
      continue;
    }

    if (regionalLeaf.test(normalized) || nationalLeaf.test(normalized)) {
      links.add(normalized);
    }
  }

  return [...links].sort((left, right) => left.localeCompare(right));
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) {
    return null;
  }

  const title = normalizeWhitespace(match[1])
    .replace(/^⚽\s*/u, '')
    .replace(/\s*\|\s*HollandseVelden\.nl$/i, '')
    .trim();

  return title || null;
}

function deriveCompetitionLabel(title: string, season: string, matchday: MatchdayType): string {
  const marker = ` - ${season.replace('-', '/')}`;
  const markerIndex = title.indexOf(marker);
  let label = markerIndex > 0 ? title.slice(0, markerIndex).trim() : title.trim();

  if (matchday === 'za' && !/^zaterdag\b/i.test(label)) {
    label = `Zaterdag ${label}`;
  }

  if (matchday === 'zo' && !/^zondag\b/i.test(label)) {
    label = `Zondag ${label}`;
  }

  return normalizeWhitespace(label);
}

function titleCaseDistrict(value: string): string {
  return value
    .split('-')
    .map((part) => (part.length === 1 ? part.toUpperCase() : `${part[0].toUpperCase()}${part.slice(1)}`))
    .join(' ');
}

function parsePathMetadata(pathValue: string): { regionLabel: string; matchday: MatchdayType } {
  const segments = pathValue.split('/').filter(Boolean);
  const district = segments[2] ?? 'landelijk';
  const matchday = (segments[3] === 'za' || segments[3] === 'zo') ? segments[3] : null;

  if (district === 'landelijk') {
    return { regionLabel: 'Landelijk', matchday };
  }

  return {
    regionLabel: titleCaseDistrict(district),
    matchday
  };
}

function matchdayTypeLabel(matchday: MatchdayType): 'saturday' | 'sunday' | 'mixed' {
  if (matchday === 'za') {
    return 'saturday';
  }
  if (matchday === 'zo') {
    return 'sunday';
  }
  return 'mixed';
}

function deriveTier(label: string): number {
  const normalized = label.toLowerCase();

  if (normalized.includes('eredivisie')) return 1;
  if (normalized.includes('eerste divisie')) return 2;
  if (normalized.includes('tweede divisie')) return 3;
  if (normalized.includes('derde divisie')) return 4;
  if (normalized.includes('vierde divisie')) return 5;
  if (normalized.includes('topklasse')) return 6;
  if (normalized.includes('hoofdklasse')) return 6;

  const klasseMatch = normalized.match(/([1-5])e\s*klasse/);
  if (klasseMatch) {
    const klasse = Number(klasseMatch[1]);
    if (Number.isFinite(klasse)) {
      return 5 + klasse;
    }
  }

  return 20;
}

function isO21CompetitionLabel(label: string): boolean {
  return /\b(o21|onder\s*21|u21)\b/i.test(label);
}

function buildO21CompetitionRecords(season: string): CompetitionSeedRecord[] {
  return O21_COMPETITIONS.map((competition) => ({
    path: `/competities/${season}/landelijk/onder-21/${competition.suffix}/`,
    competitionLabel: competition.competitionLabel,
    regionLabel: 'O21',
    matchdayType: 'mixed',
    tier: competition.tier,
    clubs: competition.clubs.map((club) => ({
      name: club.name,
      clubUrl: null,
      logoUrl: null,
      city: club.city,
      region: 'O21',
      stadium: null,
      streetAddress: null,
      postalCode: null,
      parentClubName: club.parentClubName
    }))
  }));
}

function mergeCompetitionRecords(
  baseRecords: CompetitionSeedRecord[],
  extraRecords: CompetitionSeedRecord[]
): CompetitionSeedRecord[] {
  const seen = new Set<string>();
  const merged: CompetitionSeedRecord[] = [];

  for (const record of [...baseRecords, ...extraRecords]) {
    const key = `${record.path}|${record.competitionLabel}|${record.regionLabel}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(record);
  }

  return merged;
}

function extractJsonLdBlocks(html: string): unknown[] {
  const scriptPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks: unknown[] = [];

  for (const match of html.matchAll(scriptPattern)) {
    const raw = match[1].trim();
    if (!raw) {
      continue;
    }

    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Skip malformed JSON-LD blocks.
    }
  }

  return blocks;
}

function walkJson(node: unknown, visitor: (value: Record<string, unknown>) => void): void {
  if (Array.isArray(node)) {
    for (const child of node) {
      walkJson(child, visitor);
    }
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  const record = node as Record<string, unknown>;
  visitor(record);

  for (const value of Object.values(record)) {
    walkJson(value, visitor);
  }
}

function extractText(value: unknown): string | null {
  return typeof value === 'string' ? normalizeWhitespace(value) : null;
}

function extractObjectId(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  return typeof record['@id'] === 'string' ? record['@id'] : null;
}

function idPrefix(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const index = value.indexOf('#');
  if (index === -1) {
    return value;
  }
  return value.slice(0, index);
}

function parseClubListFromFaqText(text: string): string[] {
  const cleaned = normalizeWhitespace(text.replace(/<[^>]+>/g, ' '));
  if (!cleaned) {
    return [];
  }

  const colonIndex = cleaned.indexOf(':');
  let listText = colonIndex >= 0 ? cleaned.slice(colonIndex + 1).trim() : cleaned;
  listText = listText.replace(/\.$/, '').trim();
  listText = listText.replace(/\sen\s(?=[^,]+$)/i, ', ');

  return uniqueStrings(
    listText
      .split(',')
      .map((name) => name.trim().replace(/\.$/, ''))
      .filter(Boolean)
  );
}

function upsertTeam(
  teamsByName: Map<string, TeamSeedInternal>,
  team: TeamSeedInternal
): void {
  const key = clubNameKey(team.name);
  const existing = teamsByName.get(key);
  if (!existing) {
    teamsByName.set(key, team);
    return;
  }

  existing.teamId = existing.teamId ?? team.teamId;
  existing.prefix = existing.prefix ?? team.prefix;
  existing.clubUrl = existing.clubUrl ?? team.clubUrl;
  existing.logoUrl = existing.logoUrl ?? team.logoUrl;
  existing.city = existing.city ?? team.city;
  existing.region = existing.region ?? team.region;
  existing.stadium = existing.stadium ?? team.stadium;
  existing.streetAddress = existing.streetAddress ?? team.streetAddress;
  existing.postalCode = existing.postalCode ?? team.postalCode;
}

function extractLocationRecord(record: Record<string, unknown>): LocationSeedRecord | null {
  const locationId = typeof record['@id'] === 'string' ? record['@id'] : null;
  if (!locationId) {
    return null;
  }

  const stadium = extractText(record.name);
  const prefix = idPrefix(locationId);

  let city: string | null = null;
  let region: string | null = null;
  let streetAddress: string | null = null;
  let postalCode: string | null = null;

  const address = record.address;
  if (address && typeof address === 'object') {
    const addressRecord = address as Record<string, unknown>;
    city = extractText(addressRecord.addressLocality);
    region = extractText(addressRecord.addressRegion);
    streetAddress = extractText(addressRecord.streetAddress);
    postalCode = extractText(addressRecord.postalCode);
  }

  return {
    locationId,
    prefix,
    stadium,
    city,
    region,
    streetAddress,
    postalCode
  };
}

function clubCityFallbackFromLogo(logoUrl: string | null): string | null {
  if (!logoUrl) {
    return null;
  }
  const match = logoUrl.match(/_uit_([a-z0-9-]+)\.(?:png|webp|jpg|jpeg)$/i);
  if (!match) {
    return null;
  }
  return slugToTitleCase(match[1]);
}

function extractClubsFromJsonLd(jsonBlocks: unknown[]): ClubSeedRecord[] {
  const faqNames: string[] = [];
  const standingsNames: string[] = [];
  const teamsByName = new Map<string, TeamSeedInternal>();
  const locationById = new Map<string, LocationSeedRecord>();
  const locationByPrefix = new Map<string, LocationSeedRecord>();
  const homeLocationByTeamId = new Map<string, string>();

  for (const block of jsonBlocks) {
    walkJson(block, (record) => {
      const typeValue = record['@type'];
      const type = typeof typeValue === 'string' ? typeValue : '';

      if (type === 'FAQPage') {
        const mainEntity = record.mainEntity;
        if (Array.isArray(mainEntity)) {
          for (const item of mainEntity) {
            if (!item || typeof item !== 'object') {
              continue;
            }

            const question = item as Record<string, unknown>;
            const questionName = typeof question.name === 'string' ? question.name : '';
            if (!/Welke verenigingen nemen deel/i.test(questionName)) {
              continue;
            }

            const acceptedAnswer = question.acceptedAnswer;
            if (!acceptedAnswer || typeof acceptedAnswer !== 'object') {
              continue;
            }

            const answer = acceptedAnswer as Record<string, unknown>;
            const text = typeof answer.text === 'string' ? answer.text : '';
            faqNames.push(...parseClubListFromFaqText(text));
          }
        }
      }

      if (type === 'ListItem') {
        const item = record.item;
        if (item && typeof item === 'object') {
          const itemRecord = item as Record<string, unknown>;
          if (itemRecord['@type'] === 'SportsTeam' && typeof itemRecord.name === 'string') {
            standingsNames.push(normalizeWhitespace(itemRecord.name));
          }
        }
      }

      if (type === 'SportsTeam') {
        const gender = typeof record.gender === 'string' ? record.gender.toLowerCase() : '';
        if (gender && gender !== 'male') {
          return;
        }

        const name = extractText(record.name);
        if (!name) {
          return;
        }

        const teamId = typeof record['@id'] === 'string' ? record['@id'] : null;
        const clubUrl = extractText(record.url);
        const teamPrefix = idPrefix(teamId) ?? idPrefix(clubUrl);
        const logoUrl = extractText(record.logo);

        upsertTeam(teamsByName, {
          teamId,
          prefix: teamPrefix,
          name,
          clubUrl,
          logoUrl,
          city: null,
          region: null,
          stadium: null,
          streetAddress: null,
          postalCode: null
        });
      }

      if (type === 'SportsActivityLocation') {
        const locationRecord = extractLocationRecord(record);
        if (!locationRecord) {
          return;
        }

        locationById.set(locationRecord.locationId, locationRecord);
        if (locationRecord.prefix) {
          locationByPrefix.set(locationRecord.prefix, locationRecord);
        }
      }

      if (type === 'SportsEvent') {
        const homeTeamId = extractObjectId(record.homeTeam);
        const locationId = extractObjectId(record.location);
        if (homeTeamId && locationId) {
          homeLocationByTeamId.set(homeTeamId, locationId);
        }
      }
    });
  }

  for (const team of teamsByName.values()) {
    const locationId = team.teamId ? homeLocationByTeamId.get(team.teamId) ?? null : null;
    const locationFromHome = locationId ? locationById.get(locationId) ?? null : null;
    const locationFromPrefix = team.prefix ? locationByPrefix.get(team.prefix) ?? null : null;
    const location = locationFromHome ?? locationFromPrefix;

    if (location) {
      team.city = team.city ?? location.city;
      team.region = team.region ?? location.region;
      team.stadium = team.stadium ?? location.stadium;
      team.streetAddress = team.streetAddress ?? location.streetAddress;
      team.postalCode = team.postalCode ?? location.postalCode;
    }

    team.city = team.city ?? clubCityFallbackFromLogo(team.logoUrl);
  }

  const faqOrdered = uniqueStrings(faqNames);
  const standingsOrdered = uniqueStrings(standingsNames);
  const orderedNames = faqOrdered.length > 0 ? faqOrdered : standingsOrdered;

  const ordered: ClubSeedRecord[] = [];
  const seen = new Set<string>();

  if (orderedNames.length > 0) {
    for (const name of orderedNames) {
      const key = clubNameKey(name);
      const team = teamsByName.get(key);
      ordered.push({
        name,
        clubUrl: team?.clubUrl ?? null,
        logoUrl: team?.logoUrl ?? null,
        city: team?.city ?? null,
        region: team?.region ?? null,
        stadium: team?.stadium ?? null,
        streetAddress: team?.streetAddress ?? null,
        postalCode: team?.postalCode ?? null
      });
      seen.add(key);
    }
  }

  for (const team of teamsByName.values()) {
    const key = clubNameKey(team.name);
    if (seen.has(key)) {
      continue;
    }

    ordered.push({
      name: team.name,
      clubUrl: team.clubUrl,
      logoUrl: team.logoUrl,
      city: team.city,
      region: team.region,
      stadium: team.stadium,
      streetAddress: team.streetAddress,
      postalCode: team.postalCode
    });
    seen.add(key);
  }

  return ordered;
}

async function fetchHtml(url: string, retries = 3): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await axios.get<string>(url, {
        timeout: 25_000,
        headers: {
          'User-Agent': 'SoccerDirectorV2Seeder/1.0 (+https://github.com)'
        },
        responseType: 'text'
      });

      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

async function mapWithConcurrency<T, U>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<U>
): Promise<U[]> {
  const result: U[] = new Array(values.length);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= values.length) {
        return;
      }
      result[current] = await mapper(values[current], current);
    }
  };

  const workerCount = Math.max(1, Math.min(concurrency, values.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return result;
}

function hashCode(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function baseReputationForTier(tier: number): number {
  return clamp(96 - ((tier - 1) * 7), 20, 96);
}

function baseFinancialForTier(tier: number): number {
  return clamp(90 - ((tier - 1) * 6), 18, 90);
}

function boardExpectationForTier(tier: number): string {
  if (tier <= 2) return 'title-challenge';
  if (tier <= 5) return 'promotion';
  if (tier <= 7) return 'top-half';
  return 'mid-table';
}

function estimateCapacity(tier: number, seedKey: string): number {
  const baseByTier = new Map<number, number>([
    [1, 26000],
    [2, 15000],
    [3, 8500],
    [4, 6000],
    [5, 4200],
    [6, 3200],
    [7, 2600],
    [8, 2100],
    [9, 1700],
    [10, 1400]
  ]);

  const base = baseByTier.get(tier) ?? 1200;
  const hash = hashCode(seedKey);
  const jitterFactor = 0.8 + ((hash % 40) / 100);
  const value = Math.round((base * jitterFactor) / 50) * 50;
  return clamp(value, 600, 60000);
}

function estimateMoney(tier: number, seedKey: string): {
  balance: number;
  transferBudget: number;
  wageBudget: number;
} {
  const baseByTier: Record<number, { balance: number; transfer: number; wage: number }> = {
    1: { balance: 25_000_000, transfer: 8_000_000, wage: 4_200_000 },
    2: { balance: 10_000_000, transfer: 3_000_000, wage: 1_600_000 },
    3: { balance: 3_200_000, transfer: 900_000, wage: 700_000 },
    4: { balance: 1_200_000, transfer: 300_000, wage: 260_000 },
    5: { balance: 700_000, transfer: 160_000, wage: 150_000 },
    6: { balance: 300_000, transfer: 80_000, wage: 90_000 },
    7: { balance: 200_000, transfer: 50_000, wage: 60_000 },
    8: { balance: 130_000, transfer: 30_000, wage: 44_000 },
    9: { balance: 100_000, transfer: 20_000, wage: 34_000 },
    10: { balance: 80_000, transfer: 15_000, wage: 28_000 }
  };

  const fallback = { balance: 70_000, transfer: 12_000, wage: 24_000 };
  const selected = baseByTier[tier] ?? fallback;
  const hash = hashCode(seedKey);
  const jitterFactor = 0.82 + ((hash % 36) / 100);

  return {
    balance: Math.round(selected.balance * jitterFactor),
    transferBudget: Math.round(selected.transfer * jitterFactor),
    wageBudget: Math.round(selected.wage * jitterFactor)
  };
}

function toClubRow(club: ClubSeedRecord, leagueId: number, tier: number) {
  const seedKey = `${club.name}:${leagueId}:${tier}`;
  const jitter = (hashCode(seedKey) % 9) - 4;
  const reputation = clamp(baseReputationForTier(tier) + jitter, 15, 99);
  const financialStatus = clamp(baseFinancialForTier(tier) + jitter, 10, 95);
  const capacity = estimateCapacity(tier, seedKey);
  const money = estimateMoney(tier, seedKey);
  const city = club.city ?? clubCityFallbackFromLogo(club.logoUrl);

  return {
    name: club.name,
    shortName: club.name.length > 24 ? club.name.slice(0, 24).trim() : null,
    sourceUrl: club.clubUrl,
    logoUrl: club.logoUrl,
    city,
    region: club.region,
    streetAddress: club.streetAddress,
    postalCode: club.postalCode,
    stadium: club.stadium ?? null,
    capacity,
    reputation,
    financialStatus,
    morale: 55,
    form: 'NNNNN',
    boardExpectation: boardExpectationForTier(tier),
    primaryColor: null,
    secondaryColor: null,
    leagueId,
    balance: money.balance,
    transferBudget: money.transferBudget,
    wageBudget: money.wageBudget,
    averageAttendance: Math.round(capacity * 0.56),
    isUserControlled: false,
    isActive: true
  };
}

function summarize(records: CompetitionSeedRecord[]): {
  leagues: number;
  clubs: number;
  withCity: number;
  withStadium: number;
} {
  let clubs = 0;
  let withCity = 0;
  let withStadium = 0;

  for (const record of records) {
    for (const club of record.clubs) {
      clubs += 1;
      if (club.city || clubCityFallbackFromLogo(club.logoUrl)) {
        withCity += 1;
      }
      if (club.stadium) {
        withStadium += 1;
      }
    }
  }

  return {
    leagues: records.length,
    clubs,
    withCity,
    withStadium
  };
}

function writeSnapshot(snapshotPath: string, records: CompetitionSeedRecord[], options: SeedOptions): void {
  const totals = summarize(records);
  const payload: SnapshotFile = {
    version: SNAPSHOT_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      season: options.season,
      baseUrl: options.baseUrl
    },
    totals,
    records
  };

  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(snapshotPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function normalizeSnapshotRecord(value: unknown): CompetitionSeedRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.path !== 'string' || typeof record.competitionLabel !== 'string' || typeof record.regionLabel !== 'string') {
    return null;
  }

  const tier = Number(record.tier);
  if (!Number.isFinite(tier)) {
    return null;
  }
  const rawMatchdayType = typeof record.matchdayType === 'string' ? record.matchdayType : 'mixed';
  const matchdayType = (rawMatchdayType === 'saturday' || rawMatchdayType === 'sunday' || rawMatchdayType === 'mixed')
    ? rawMatchdayType
    : 'mixed';

  const clubsRaw = Array.isArray(record.clubs) ? record.clubs : [];
  const clubs: ClubSeedRecord[] = [];

  for (const entry of clubsRaw) {
    if (typeof entry === 'string') {
      const name = normalizeWhitespace(entry);
      if (!name) {
        continue;
      }
      clubs.push({
        name,
        clubUrl: null,
        logoUrl: null,
        city: null,
        region: null,
        stadium: null,
        streetAddress: null,
        postalCode: null
      });
      continue;
    }

    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const clubRecord = entry as Record<string, unknown>;
    const name = typeof clubRecord.name === 'string' ? normalizeWhitespace(clubRecord.name) : '';
    if (!name) {
      continue;
    }

    clubs.push({
      name,
      clubUrl: typeof clubRecord.clubUrl === 'string' ? clubRecord.clubUrl : null,
      logoUrl: typeof clubRecord.logoUrl === 'string' ? clubRecord.logoUrl : null,
      city: typeof clubRecord.city === 'string' ? normalizeWhitespace(clubRecord.city) : null,
      region: typeof clubRecord.region === 'string' ? normalizeWhitespace(clubRecord.region) : null,
      stadium: typeof clubRecord.stadium === 'string' ? normalizeWhitespace(clubRecord.stadium) : null,
      streetAddress: typeof clubRecord.streetAddress === 'string' ? normalizeWhitespace(clubRecord.streetAddress) : null,
      postalCode: typeof clubRecord.postalCode === 'string' ? normalizeWhitespace(clubRecord.postalCode) : null,
      parentClubName: typeof clubRecord.parentClubName === 'string'
        ? normalizeWhitespace(clubRecord.parentClubName)
        : null
    });
  }

  if (clubs.length < 2) {
    return null;
  }

  return {
    path: record.path,
    competitionLabel: normalizeWhitespace(record.competitionLabel),
    regionLabel: normalizeWhitespace(record.regionLabel),
    matchdayType,
    tier: Math.floor(tier),
    clubs
  };
}

function loadSnapshot(snapshotPath: string): CompetitionSeedRecord[] {
  const raw = fs.readFileSync(snapshotPath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Snapshot file has invalid shape.');
  }

  const root = parsed as Record<string, unknown>;
  const recordsRaw = Array.isArray(root.records) ? root.records : [];
  const records = recordsRaw
    .map((value) => normalizeSnapshotRecord(value))
    .filter((value): value is CompetitionSeedRecord => value !== null);

  if (records.length === 0) {
    throw new Error('Snapshot contains no valid competition records.');
  }

  return records;
}

async function clearExistingData(): Promise<void> {
  console.log('[seed:clubs] Clearing existing game data...');

  await prisma.v2AuditLog.deleteMany();
  await prisma.v2Highlight.deleteMany();
  await prisma.v2Match.deleteMany();
  await prisma.v2EventDecision.deleteMany();
  await prisma.v2InboxEvent.deleteMany();
  await prisma.v2WeekPlan.deleteMany();
  await prisma.v2Fixture.deleteMany();
  await prisma.v2PlayerState.deleteMany();
  await prisma.v2ClubState.deleteMany();
  await prisma.v2LeagueState.deleteMany();
  await prisma.v2SaveSlot.deleteMany();
  await prisma.v2Career.deleteMany();

  await prisma.matchEvent.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.teamInCompetition.deleteMany();
  await prisma.transferOffer.deleteMany();
  await prisma.transferListing.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.sponsorship.deleteMany();
  await prisma.mentorship.deleteMany();
  await prisma.playerMoraleEvent.deleteMany();
  await prisma.playerAttribute.deleteMany();
  await prisma.playerContract.deleteMany();
  await prisma.startingXI.deleteMany();
  await prisma.clubFinances.deleteMany();
  await prisma.clubFacility.deleteMany();
  await prisma.clubSeasonStats.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.player.deleteMany();
  await prisma.club.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.league.deleteMany();
}

async function scrapeMenPyramid(options: SeedOptions): Promise<{
  records: CompetitionSeedRecord[];
  failures: CompetitionScrapeFailure[];
}> {
  const indexUrl = `${options.baseUrl}/competities/${options.season}/`;
  console.log(`[seed:clubs] Loading index: ${indexUrl}`);
  const indexHtml = await fetchHtml(indexUrl);
  const allPaths = extractCompetitionPaths(indexHtml, options.season);
  const paths = options.maxLeagues ? allPaths.slice(0, options.maxLeagues) : allPaths;

  console.log(
    `[seed:clubs] Found ${allPaths.length} men competition pages` +
    (options.maxLeagues ? ` (processing first ${paths.length})` : '')
  );

  const failures: CompetitionScrapeFailure[] = [];

  const records = await mapWithConcurrency(paths, options.concurrency, async (pathValue, index) => {
    const pageUrl = `${options.baseUrl}${pathValue}`;
    const html = await fetchHtml(pageUrl);
    const title = extractTitle(html);

    if (!title) {
      throw new Error('Missing <title>');
    }

    const { regionLabel, matchday } = parsePathMetadata(pathValue);
    const competitionLabel = deriveCompetitionLabel(title, options.season, matchday);
    const clubs = extractClubsFromJsonLd(extractJsonLdBlocks(html));

    if (clubs.length < 2) {
      throw new Error(`No club list found (clubs=${clubs.length})`);
    }

    if ((index + 1) % 25 === 0 || index === paths.length - 1) {
      console.log(`[seed:clubs] Scraped ${index + 1}/${paths.length}`);
    }

    return {
      path: pathValue,
      competitionLabel,
      regionLabel,
      matchdayType: matchdayTypeLabel(matchday),
      tier: deriveTier(competitionLabel),
      clubs
    } as CompetitionSeedRecord;
  }).catch((error: unknown) => {
    console.warn('[seed:clubs] Concurrent scrape interrupted, retrying resilient mode.', error);
    return [];
  });

  if (records.length > 0) {
    return { records, failures };
  }

  const resilient: CompetitionSeedRecord[] = [];
  for (let index = 0; index < paths.length; index += 1) {
    const pathValue = paths[index];
    try {
      const html = await fetchHtml(`${options.baseUrl}${pathValue}`);
      const title = extractTitle(html);
      if (!title) {
        throw new Error('Missing <title>');
      }

      const { regionLabel, matchday } = parsePathMetadata(pathValue);
      const competitionLabel = deriveCompetitionLabel(title, options.season, matchday);
      const clubs = extractClubsFromJsonLd(extractJsonLdBlocks(html));
      if (clubs.length < 2) {
        throw new Error(`No club list found (clubs=${clubs.length})`);
      }

      resilient.push({
        path: pathValue,
        competitionLabel,
        regionLabel,
        matchdayType: matchdayTypeLabel(matchday),
        tier: deriveTier(competitionLabel),
        clubs
      });
    } catch (error) {
      failures.push({
        path: pathValue,
        reason: error instanceof Error ? error.message : 'Unknown scrape failure'
      });
    }

    if ((index + 1) % 25 === 0 || index === paths.length - 1) {
      console.log(`[seed:clubs] Scraped ${index + 1}/${paths.length}`);
    }
  }

  return {
    records: resilient,
    failures
  };
}

function printRegionalSummary(records: CompetitionSeedRecord[]): void {
  const byRegion = new Map<string, { leagues: number; clubs: number }>();

  for (const record of records) {
    const current = byRegion.get(record.regionLabel) ?? { leagues: 0, clubs: 0 };
    current.leagues += 1;
    current.clubs += record.clubs.length;
    byRegion.set(record.regionLabel, current);
  }

  const rows = [...byRegion.entries()].sort((left, right) => left[0].localeCompare(right[0]));
  console.log('[seed:clubs] Regional summary:');
  for (const [region, item] of rows) {
    console.log(`  - ${region}: leagues=${item.leagues}, clubs=${item.clubs}`);
  }

  const totals = summarize(records);
  console.log(
    `[seed:clubs] Metadata coverage: withCity=${totals.withCity}/${totals.clubs}, ` +
    `withStadium=${totals.withStadium}/${totals.clubs}`
  );
}

function isO21CompetitionRecord(record: CompetitionSeedRecord): boolean {
  return record.regionLabel === 'O21' || isO21CompetitionLabel(record.competitionLabel);
}

async function seedDatabase(records: CompetitionSeedRecord[], dryRun: boolean): Promise<{
  leaguesSeeded: number;
  clubsSeeded: number;
}> {
  const sorted = [...records].sort((left, right) => {
    if (left.tier !== right.tier) {
      return left.tier - right.tier;
    }
    if (left.regionLabel !== right.regionLabel) {
      return left.regionLabel.localeCompare(right.regionLabel);
    }
    return left.competitionLabel.localeCompare(right.competitionLabel);
  });

  let leaguesSeeded = 0;
  let clubsSeeded = 0;
  let parentClubLookup:
    | Map<string, { id: number; stadium: string | null; primaryColor: string | null; secondaryColor: string | null }>
    | null = null;

  for (const record of sorted) {
    const leagueName = `${record.regionLabel} - ${record.competitionLabel}`;
    leaguesSeeded += 1;
    clubsSeeded += record.clubs.length;

    if (dryRun) {
      continue;
    }

    const league = await prisma.league.create({
      data: {
        name: leagueName,
        level: record.competitionLabel,
        region: record.regionLabel,
        matchdayType: record.matchdayType,
        sourcePath: record.path,
        country: 'Netherlands',
        tier: record.tier,
        isActive: true
      }
    });

    if (!isO21CompetitionRecord(record)) {
      await prisma.club.createMany({
        data: record.clubs.map((club) => toClubRow(club, league.id, record.tier))
      });
      continue;
    }

    if (!parentClubLookup) {
      const potentialParents = await prisma.club.findMany({
        where: {
          isActive: true,
          isJongTeam: false
        },
        select: {
          id: true,
          name: true,
          stadium: true,
          primaryColor: true,
          secondaryColor: true
        }
      });
      parentClubLookup = new Map(
        potentialParents.map((club) => [
          clubNameKey(club.name),
          {
            id: club.id,
            stadium: club.stadium ?? null,
            primaryColor: club.primaryColor ?? null,
            secondaryColor: club.secondaryColor ?? null
          }
        ])
      );
    }

    for (const club of record.clubs) {
      const row = toClubRow(club, league.id, record.tier);
      const parent = club.parentClubName
        ? parentClubLookup.get(clubNameKey(club.parentClubName))
        : undefined;

      await prisma.club.create({
        data: {
          ...row,
          boardExpectation: 'development',
          isJongTeam: true,
          parentClubId: parent?.id ?? null,
          stadium: row.stadium ?? parent?.stadium ?? null,
          primaryColor: row.primaryColor ?? parent?.primaryColor ?? null,
          secondaryColor: row.secondaryColor ?? parent?.secondaryColor ?? null
        }
      });
    }
  }

  return { leaguesSeeded, clubsSeeded };
}

async function loadOrBuildSnapshot(options: SeedOptions): Promise<{
  records: CompetitionSeedRecord[];
  failures: CompetitionScrapeFailure[];
  source: 'snapshot' | 'scrape';
}> {
  const snapshotExists = fs.existsSync(options.snapshotPath);
  const o21Records = buildO21CompetitionRecords(options.season);

  if (snapshotExists && !options.refresh) {
    const loaded = loadSnapshot(options.snapshotPath);
    const records = options.maxLeagues ? loaded.slice(0, options.maxLeagues) : loaded;
    const merged = mergeCompetitionRecords(records, o21Records);
    return { records: merged, failures: [], source: 'snapshot' };
  }

  if (!snapshotExists && !options.refresh) {
    throw new Error(
      `Snapshot not found at ${options.snapshotPath}. ` +
      'Run once with --refresh to fetch and store the men pyramid locally.'
    );
  }

  const scraped = await scrapeMenPyramid(options);
  if (scraped.records.length === 0) {
    throw new Error('No men competitions were scraped from HollandseVelden.');
  }

  const merged = mergeCompetitionRecords(scraped.records, o21Records);
  writeSnapshot(options.snapshotPath, merged, options);
  return {
    records: merged,
    failures: scraped.failures,
    source: 'scrape'
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  console.log(
    `[seed:clubs] Start season=${options.season} dryRun=${options.dryRun} ` +
    `wipeExisting=${options.wipeExisting} refresh=${options.refresh} concurrency=${options.concurrency}`
  );
  console.log(`[seed:clubs] Snapshot path: ${options.snapshotPath}`);

  const { records, failures, source } = await loadOrBuildSnapshot(options);
  console.log(`[seed:clubs] Data source: ${source === 'snapshot' ? 'local snapshot' : 'live scrape'}`);
  if (source === 'scrape') {
    console.log(`[seed:clubs] Snapshot written: ${options.snapshotPath}`);
  }

  printRegionalSummary(records);

  if (failures.length > 0) {
    console.warn(`[seed:clubs] ${failures.length} competition pages failed to parse:`);
    failures.slice(0, 20).forEach((failure) => {
      console.warn(`  - ${failure.path}: ${failure.reason}`);
    });
    if (failures.length > 20) {
      console.warn(`  ...and ${failures.length - 20} more`);
    }
  }

  if (!options.dryRun && options.wipeExisting) {
    await clearExistingData();
  }

  const { leaguesSeeded, clubsSeeded } = await seedDatabase(records, options.dryRun);

  console.log(
    `[seed:clubs] Completed. leagues=${leaguesSeeded} clubs=${clubsSeeded} ` +
    `dryRun=${options.dryRun} failures=${failures.length}`
  );
}

main()
  .catch((error) => {
    console.error('[seed:clubs] failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

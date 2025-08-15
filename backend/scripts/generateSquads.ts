/*
  Generate synthetic player squads with exact-sum skills for clubs in backend/clubdata.md
  Usage:
    ts-node scripts/generateSquads.ts --source backend/clubdata.md --out backend/data/Players.synthetic.md --season 2025-2026
*/

import fs from 'fs';
import path from 'path';

interface Options {
  source: string;
  out: string;
  season: string;
}

interface ClubEntry {
  club: string;
  league: string;
}

type Position = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'W' | 'ST';

type SkillGroup = 'physical' | 'technical' | 'mental' | 'goalkeeper';

const PHYSICAL = ['pace','acceleration','stamina','strength','agility','balance'] as const;
const TECHNICAL = ['first_touch','dribbling','passing','crossing','finishing','long_shots','heading','tackling','marking'] as const;
const MENTAL = ['vision','anticipation','positioning','composure','decisions','work_rate','aggression','leadership'] as const;
const GOALKEEPER = ['gk_handling','gk_reflexes','gk_kicking','gk_positioning'] as const;

const ALL_SUBSKILLS = [
  ...PHYSICAL,
  ...TECHNICAL,
  ...MENTAL,
  ...GOALKEEPER,
] as const;

type SubSkill = typeof ALL_SUBSKILLS[number];

type Weights = Record<SubSkill, number>;

type SkillBreakdown = {
  physical: Record<typeof PHYSICAL[number], number>;
  technical: Record<typeof TECHNICAL[number], number>;
  mental: Record<typeof MENTAL[number], number>;
  goalkeeper: Record<typeof GOALKEEPER[number], number>;
};

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const get = (k: string, def?: string) => {
    const i = args.findIndex(a => a === `--${k}`);
    if (i !== -1 && args[i+1]) return args[i+1];
    return def;
  };
  const source = get('source', 'backend/clubdata.md')!;
  const out = get('out', 'backend/data/Players.synthetic.md')!;
  const season = get('season', '2025-2026')!;
  return { source, out, season };
}

function readFile(p: string): string {
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  return fs.readFileSync(abs, 'utf8');
}

function ensureDirForFile(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function extractClubs(md: string): ClubEntry[] {
  const lines = md.split(/\r?\n/);
  let currentLeague = '';
  const entries: ClubEntry[] = [];

  for (const line of lines) {
    // League headers formatted as '### Eredivisie' etc.
    const leagueMatch = line.match(/^###\s+(.+?)\s*$/);
    if (leagueMatch) {
      currentLeague = leagueMatch[1].trim();
      continue;
    }

    // Table row lines start with '|'
    if (line.startsWith('|') && line.includes('|')) {
      // Skip header separators (|---|)
      if (/^\|\s*-+\s*\|/.test(line)) continue;
      if (line.includes('|---')) continue;

      const cols = line.split('|').map(s => s.trim());
      // Expect: | # | Club | City | ...
      if (cols.length >= 4) {
        const maybeClub = cols[2]; // index 0 empty, 1 is '#', 2 is 'Club'
        const isHeader = maybeClub?.toLowerCase() === 'club';
        if (!isHeader && maybeClub) {
          entries.push({ club: maybeClub, league: currentLeague });
        }
      }
    }
  }
  return entries;
}

// Position templates: higher weights emphasize relevant sub-skills.
function baseWeights(): Weights {
  const w: Weights = Object.fromEntries(ALL_SUBSKILLS.map(k => [k, 0.5])) as Weights;
  return w;
}

function templateForPosition(pos: Position): Weights {
  const w = baseWeights();
  const inc = (keys: SubSkill[], val: number) => keys.forEach(k => w[k] += val);

  switch (pos) {
    case 'GK':
      inc(['gk_reflexes','gk_handling','gk_positioning'], 4.0);
      inc(['gk_kicking'], 2.0);
      inc(['agility'], 1.5);
      inc(['composure','decisions','anticipation'], 1.0);
      // downweight attacking finishing
      break;
    case 'CB':
      inc(['tackling','marking'], 3.5);
      inc(['heading'], 2.5);
      inc(['strength'], 2.0);
      inc(['positioning'], 2.0);
      inc(['aggression'], 1.0);
      break;
    case 'FB':
      inc(['pace','acceleration'], 2.0);
      inc(['stamina'], 1.5);
      inc(['crossing','tackling','marking'], 1.5);
      inc(['work_rate','positioning'], 1.0);
      break;
    case 'DM':
      inc(['tackling','marking'], 2.5);
      inc(['passing'], 2.0);
      inc(['positioning','decisions'], 1.5);
      inc(['strength','work_rate'], 1.0);
      break;
    case 'CM':
      inc(['passing','first_touch','vision'], 2.0);
      inc(['stamina','work_rate','decisions'], 1.0);
      break;
    case 'AM':
      inc(['dribbling','first_touch','vision','passing'], 2.0);
      inc(['composure','decisions'], 1.0);
      break;
    case 'W':
      inc(['pace','acceleration','dribbling','crossing'], 2.0);
      inc(['first_touch','agility'], 1.0);
      break;
    case 'ST':
      inc(['finishing'], 3.5);
      inc(['dribbling','first_touch'], 1.5);
      inc(['pace','acceleration'], 1.5);
      inc(['positioning','anticipation','heading'], 1.0);
      break;
  }
  // For outfielders, reduce GK skills baseline even more
  if (pos !== 'GK') {
    GOALKEEPER.forEach(k => { w[k] = Math.max(0.1, w[k] * 0.05); });
  }
  return w;
}

function allocateExactIntegers(weights: Weights, total: number): Record<SubSkill, number> {
  const arr = ALL_SUBSKILLS.map(k => ({ k, w: Math.max(0, weights[k]) }));
  const sumW = arr.reduce((a,b)=>a+b.w, 0) || 1;
  const raw = arr.map(x => ({ k: x.k, raw: (x.w / sumW) * total }));
  const base = raw.map(x => ({ k: x.k, val: Math.floor(x.raw) }));
  let remainder = total - base.reduce((a,b)=>a+b.val, 0);
  const fracs = raw.map((x, i) => ({ k: x.k, frac: x.raw - base[i].val }))
                  .sort((a,b)=>b.frac - a.frac);
  for (let i = 0; i < fracs.length && remainder > 0; i++) {
    const idx = base.findIndex(b => b.k === fracs[i].k);
    base[idx].val += 1;
    remainder--;
  }
  const out: Record<SubSkill, number> = {} as any;
  base.forEach(x => out[x.k] = x.val);
  return out;
}

function groupBreakdown(map: Record<SubSkill, number>): SkillBreakdown {
  const pick = <T extends readonly string[]>(keys: T) => keys.reduce((acc, k) => { (acc as any)[k] = map[k as SubSkill] || 0; return acc; }, {} as any);
  return {
    physical: pick(PHYSICAL),
    technical: pick(TECHNICAL),
    mental: pick(MENTAL),
    goalkeeper: pick(GOALKEEPER),
  };
}

function sumBreakdown(b: SkillBreakdown): number {
  const sumObj = (o: Record<string, number>) => Object.values(o).reduce((a,b)=>a+b,0);
  return sumObj(b.physical) + sumObj(b.technical) + sumObj(b.mental) + sumObj(b.goalkeeper);
}

function randomChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function randomInt(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }
function randomFoot() { return Math.random() < 0.78 ? 'R' : 'L'; }

function positionPlan(): Position[] {
  // 23-man squad typical distribution
  return [
    'GK','GK','GK',
    'CB','CB','CB','CB',
    'FB','FB','FB','FB',
    'DM','DM',
    'CM','CM','CM',
    'AM','AM',
    'W','W',
    'ST','ST','ST',
  ];
}

function tierForLeague(league: string): 'top'|'mid'|'low' {
  if (/Eredivisie/i.test(league)) return 'top';
  if (/Eerste Divisie/i.test(league)) return 'mid';
  return 'low';
}

function sampleTotalSkill(tier: 'top'|'mid'|'low', pos: Position): number {
  const base: Record<typeof tier, [number,number]> = {
    top: [68, 86],
    mid: [60, 78],
    low: [50, 70],
  } as const;
  const [lo, hi] = base[tier];
  let v = randomInt(lo, hi);
  // Slightly higher for first-choice positions
  if (['ST','GK','CB','CM','W'].includes(pos)) v += Math.random()<0.25?2:0;
  return Math.max(40, Math.min(90, v));
}

function samplePotential(total: number): number {
  const bonus = randomInt(0, Math.max(1, Math.round((90-total)/4)));
  return Math.min(95, total + bonus);
}

function synthName(pos: Position, nat: string): string {
  // Lightweight synthetic name bank by nationality region — keep simple
  const nlFirst = ['Daan','Koen','Jesse','Lars','Milan','Ruben','Niels','Timo','Luuk','Jelle'];
  const nlLast = ['Janssen','de Vries','Bakker','Visser','Smit','Meijer','Mulder','de Boer','Kok','van Dijk'];
  const first = randomChoice(nlFirst);
  const last = randomChoice(nlLast);
  return `${first} ${last}`;
}

function natForLeague(league: string): string {
  return /Nether|Eredivisie|Eerste/i.test(league) ? 'NL' : 'NL';
}

function generatePlayer(pos: Position, league: string) {
  const tier = tierForLeague(league);
  const total = sampleTotalSkill(tier, pos);
  const weights = templateForPosition(pos);
  const alloc = allocateExactIntegers(weights, total);
  const breakdown = groupBreakdown(alloc);
  const checkSum = sumBreakdown(breakdown);
  if (checkSum !== total) throw new Error(`Allocation mismatch: got ${checkSum}, want ${total}`);
  const age = randomInt(17, 34);
  const height = randomInt(168, pos==='GK'?198:192);
  const weight = randomInt(62, pos==='GK'?95:88);
  const nat = natForLeague(league);
  const name = synthName(pos, nat);
  return {
    name,
    pos,
    age,
    nat,
    foot: randomFoot(),
    height_cm: height,
    weight_kg: weight,
    total_skill: total,
    potential: samplePotential(total),
    contract_expiry: `${new Date().getFullYear()+randomInt(1,4)}-06-30`,
    wage_eur_week: randomInt(1000, tier==='top'?40000: tier==='mid'?15000:6000),
    market_value_eur: randomInt(100000, tier==='top'?25000000: tier==='mid'?8000000:1500000),
    status: '',
    traits: [],
    provenance: 'synthetic',
    skill_breakdown: breakdown,
  };
}

function renderClubSection(club: string, league: string, season: string, players: ReturnType<typeof generatePlayer>[]) {
  const header = `\n\n## Club: ${club} (${league})\n- season: ${season}\n`;
  const tableHeader = `\n| name | pos | age | nat | foot | height_cm | weight_kg | total_skill | potential | contract_expiry | wage_eur_week | market_value_eur | status | traits | provenance |\n|---|---|---:|:---:|:---:|---:|---:|---:|---:|:---:|---:|---:|:---:|:---|:---:|`;
  const rows = players.map(p => `\n| ${p.name} | ${p.pos} | ${p.age} | ${p.nat} | ${p.foot} | ${p.height_cm} | ${p.weight_kg} | ${p.total_skill} | ${p.potential} | ${p.contract_expiry} | ${p.wage_eur_week} | ${p.market_value_eur} | ${p.status} | ${p.traits.join('; ')} | ${p.provenance} |`).join('');

  const oneBreakdown = (p: any) => {
    const b = p.skill_breakdown;
    return `\n\n<details><summary>Breakdown: ${p.name} (${p.pos}, total_skill=${p.total_skill})</summary>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n` +
`\n\n\n\n\n\n\n\n\n\n\n` +
`\n\n\n\n` +
`\n\n\n\n` +
`\n\n\n` +
`\n\n\n` +
'```\n' +
`skill_breakdown:\n` +
`  physical:\n` + PHYSICAL.map(k=>`    ${k}: ${b.physical[k]}`).join('\n') + '\n' +
`  technical:\n` + TECHNICAL.map(k=>`    ${k}: ${b.technical[k]}`).join('\n') + '\n' +
`  mental:\n` + MENTAL.map(k=>`    ${k}: ${b.mental[k]}`).join('\n') + '\n' +
`  goalkeeper:\n` + GOALKEEPER.map(k=>`    ${k}: ${b.goalkeeper[k]}`).join('\n') + '\n' +
`# Sum = ${sumBreakdown(b)}\n` +
'```\n\n' +
'</details>';
  };
  const breakdowns = players.map(oneBreakdown).join('\n');
  return header + tableHeader + rows + '\n' + breakdowns + '\n';
}

function main() {
  const { source, out, season } = parseArgs();
  const md = readFile(source);
  const clubs = extractClubs(md);

  if (clubs.length === 0) {
    console.error('No clubs found in source. Check the markdown structure.');
    process.exit(1);
  }

  const lines: string[] = [];
  lines.push('# Players (Synthetic)');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Season: ${season}`);
  lines.push('Note: Replace synthetic entries with real data when available.');

  // group by league to keep ordering
  const byLeague = new Map<string, ClubEntry[]>();
  for (const c of clubs) {
    if (!byLeague.has(c.league)) byLeague.set(c.league, []);
    byLeague.get(c.league)!.push(c);
  }

  for (const [league, list] of byLeague.entries()) {
    lines.push(`\n# ${league}`);
    for (const { club } of list) {
      const squad = positionPlan().map(pos => generatePlayer(pos, league));
      lines.push(renderClubSection(club, league, season, squad));
    }
  }

  const outAbs = path.isAbsolute(out) ? out : path.join(process.cwd(), out);
  ensureDirForFile(outAbs);
  fs.writeFileSync(outAbs, lines.join('\n'), 'utf8');
  console.log(`✅ Wrote synthetic squads for ${clubs.length} clubs to ${out}`);
}

if (require.main === module) {
  main();
}

/*
  Create placeholder clubs across all UEFA members (excluding Netherlands).
  Output format matches markdown tables used in backend/clubdata.md, with an explicit Country column.
  Usage:
    ts-node scripts/createUEFAPlaceholderClubs.ts --count 500 --out backend/uefa_clubdata.md
*/

import fs from 'fs';
import path from 'path';

type Country = string;

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (k: string, def?: string) => {
    const i = args.findIndex(a => a === `--${k}`);
    if (i !== -1 && args[i+1]) return args[i+1];
    return def;
  };
  const count = parseInt(get('count', '500')!, 10);
  const out = get('out', 'backend/uefa_clubdata.md')!;
  return { count, out };
}

// UEFA member countries (as of 2025), excluding Netherlands per user request
const UEFA_COUNTRIES: Record<Country, string[]> = {
  Albania: ['Tirana','Durres','Shkoder'],
  Andorra: ['Andorra la Vella','Escaldes'],
  Armenia: ['Yerevan','Gyumri'],
  Austria: ['Vienna','Salzburg','Graz','Linz'],
  Azerbaijan: ['Baku','Ganja'],
  Belarus: ['Minsk','Gomel'],
  Belgium: ['Brussels','Antwerp','Bruges','Ghent'],
  Bosnia: ['Sarajevo','Banja Luka','Mostar'],
  Bulgaria: ['Sofia','Plovdiv','Varna'],
  Croatia: ['Zagreb','Split','Rijeka'],
  Cyprus: ['Nicosia','Limassol','Larnaca'],
  Czechia: ['Prague','Brno','Ostrava'],
  Denmark: ['Copenhagen','Aarhus','Odense'],
  England: ['London','Manchester','Liverpool','Birmingham','Leeds','Newcastle'],
  Estonia: ['Tallinn','Tartu'],
  Faroe_Islands: ['Torshavn','Klaksvik'],
  Finland: ['Helsinki','Tampere','Turku'],
  France: ['Paris','Lyon','Marseille','Lille','Nice','Bordeaux'],
  Georgia: ['Tbilisi','Batumi'],
  Germany: ['Berlin','Munich','Dortmund','Leipzig','Frankfurt','Hamburg'],
  Gibraltar: ['Gibraltar'],
  Greece: ['Athens','Thessaloniki'],
  Hungary: ['Budapest','Debrecen'],
  Iceland: ['Reykjavik','Kopavogur'],
  Israel: ['Tel Aviv','Haifa','Jerusalem'],
  Italy: ['Rome','Milan','Turin','Naples','Florence','Bologna','Genoa'],
  Kazakhstan: ['Almaty','Astana'],
  Kosovo: ['Pristina','Prizren'],
  Latvia: ['Riga','Daugavpils'],
  Liechtenstein: ['Vaduz'],
  Lithuania: ['Vilnius','Kaunas'],
  Luxembourg: ['Luxembourg City','Esch'],
  Malta: ['Valletta','Birkirkara'],
  Moldova: ['Chisinau','Tiraspol'],
  Monaco: ['Monaco'],
  Montenegro: ['Podgorica','Niksic'],
  North_Macedonia: ['Skopje','Bitola'],
  Northern_Ireland: ['Belfast','Derry'],
  Norway: ['Oslo','Bergen','Trondheim'],
  Poland: ['Warsaw','Krakow','Gdansk','Poznan','Wroclaw'],
  Portugal: ['Lisbon','Porto','Braga','Coimbra','Guimaraes'],
  Republic_of_Ireland: ['Dublin','Cork','Galway'],
  Romania: ['Bucharest','Cluj','Iasi'],
  Russia: ['Moscow','Saint Petersburg','Kazan'],
  San_Marino: ['San Marino'],
  Scotland: ['Glasgow','Edinburgh','Aberdeen'],
  Serbia: ['Belgrade','Novi Sad','Nis'],
  Slovakia: ['Bratislava','Kosice'],
  Slovenia: ['Ljubljana','Maribor'],
  Spain: ['Madrid','Barcelona','Valencia','Seville','Bilbao','Villarreal'],
  Sweden: ['Stockholm','Gothenburg','Malmo'],
  Switzerland: ['Zurich','Geneva','Basel','Bern'],
  Turkey: ['Istanbul','Ankara','Izmir','Trabzon'],
  Ukraine: ['Kyiv','Lviv','Odesa','Dnipro'],
  Wales: ['Cardiff','Swansea','Wrexham']
};

const EXCLUDE_COUNTRIES = new Set<Country>(['Netherlands']);

const prefixes = ['FC','SC','AC','Athletic','Sporting','Real','Union','Dynamo','Rapid','Lokomotiv','Racing','Standard','Partizan','Sparta'];
const suffixes = ['United','City','Town','Rovers','Wanderers','CF','AS','SV','BK','IF','SK','Calcio','FK'];
const stadiums = ['Arena','Stadium','Park','Ground','Coliseum'];
const kits = ['🔴⚪','🔵⚪','🟡⚫','🟢⚪','🟠⚫','⚪⚫','🔴🔵','🔵🟡','🟢🔴','⚫🔵'];

function randomChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function randint(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }

function generateClubs(count: number) {
  // Build a flat list of (country, city)
  const pool: { country: Country; city: string }[] = [];
  for (const [country, cities] of Object.entries(UEFA_COUNTRIES)) {
    if (EXCLUDE_COUNTRIES.has(country as Country)) continue;
    for (const city of cities) pool.push({ country: country as Country, city });
  }
  const seen = new Set<string>();
  const out: { country: Country; club: string; city: string }[] = [];

  let idx = 0;
  while (out.length < count) {
    const pick = pool[idx % pool.length];
    idx++;
    const club = `${randomChoice(prefixes)} ${pick.city} ${randomChoice(suffixes)}`.replace(/\s+/g,' ').trim();
    const key = `${pick.country}:${club}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ country: pick.country, club, city: pick.city });
  }
  return out;
}

function buildMarkdown(clubs: { country: Country; club: string; city: string }[]) {
  const header = ['# UEFA Placeholder Club Data','', 'This file lists placeholder clubs for UEFA competitions (excluding Netherlands).','', '## 2025-2026 Season', '', '### UEFA Placeholder Pool', ''].join('\n');
  const tableHead = '| # | Country | Club | City | Stadium | Capacity | Kit (H/A) | Board Expectation | Value | Rep |\n|---|---------|------|------|---------|----------|-----------|-------------------|-------|-----|';
  const rows = clubs.map((c, i) => {
    const stadium = `${c.city} ${randomChoice(stadiums)}`;
    const cap = randint(5000, 60000);
    const kit = `${randomChoice(kits)} / ${randomChoice(kits)}`;
    const expect = i % 20 === 0 ? 'Title Challenge' : (i % 10 === 0 ? 'European Spot' : 'Mid-table');
    const value = `€${randint(1, 600)}M`;
    const rep = '★★☆☆☆';
    return `| ${i+1} | ${c.country} | ${c.club} | ${c.city} | ${stadium} | ${cap} | ${kit} | ${expect} | ${value} | ${rep} |`;
  }).join('\n');
  return `${header}\n${tableHead}\n${rows}\n`;
}

function main() {
  const { count, out } = parseArgs();
  const clubs = generateClubs(count);
  const md = buildMarkdown(clubs);
  const abs = path.isAbsolute(out) ? out : path.join(process.cwd(), out);
  fs.writeFileSync(abs, md, 'utf8');
  console.log(`✅ Wrote ${clubs.length} UEFA placeholder clubs to ${out}`);
}

if (require.main === module) {
  main();
}

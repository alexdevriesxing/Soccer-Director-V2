/*
  Create placeholder clubs across FIFA confederations OUTSIDE UEFA (AFC, CAF, CONCACAF, CONMEBOL, OFC).
  Output format matches markdown tables used in backend/clubdata.md, with explicit Country and Confederation columns.
  Usage:
    ts-node scripts/createFIFAPlaceholderClubs.ts --count 600 --out backend/fifa_clubdata.md
*/

import fs from 'fs';
import path from 'path';

type Country = string;

type Confederation = 'AFC' | 'CAF' | 'CONCACAF' | 'CONMEBOL' | 'OFC';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (k: string, def?: string) => {
    const i = args.findIndex(a => a === `--${k}`);
    if (i !== -1 && args[i+1]) return args[i+1];
    return def;
  };
  const count = parseInt(get('count', '600')!, 10);
  const out = get('out', 'backend/fifa_clubdata.md')!;
  return { count, out };
}

// Confederation -> Countries -> Cities. Excludes UEFA.
const CONFEDS: Record<Confederation, Record<Country, string[]>> = {
  AFC: {
    Japan: ['Tokyo','Osaka','Yokohama','Nagoya'],
    South_Korea: ['Seoul','Busan','Incheon'],
    China: ['Beijing','Shanghai','Guangzhou'],
    Australia: ['Sydney','Melbourne','Brisbane','Perth'],
    Saudi_Arabia: ['Riyadh','Jeddah','Dammam'],
    Qatar: ['Doha','Al Rayyan'],
    United_Arab_Emirates: ['Dubai','Abu Dhabi','Sharjah'],
    Iran: ['Tehran','Isfahan','Mashhad'],
    Iraq: ['Baghdad','Basra'],
    India: ['Mumbai','Kolkata','Bengaluru','Delhi'],
    Indonesia: ['Jakarta','Surabaya','Bandung'],
    Thailand: ['Bangkok','Chiang Mai'],
    Vietnam: ['Hanoi','Ho Chi Minh City','Da Nang'],
    Malaysia: ['Kuala Lumpur','Johor Bahru'],
  },
  CAF: {
    Egypt: ['Cairo','Alexandria','Giza'],
    Morocco: ['Casablanca','Rabat','Marrakesh'],
    Algeria: ['Algiers','Oran'],
    Tunisia: ['Tunis','Sfax'],
    Nigeria: ['Lagos','Abuja','Port Harcourt'],
    Ghana: ['Accra','Kumasi'],
    Senegal: ['Dakar','Thiès'],
    Ivory_Coast: ['Abidjan','Bouaké'],
    South_Africa: ['Johannesburg','Cape Town','Durban','Pretoria'],
    DR_Congo: ['Kinshasa','Lubumbashi'],
    Cameroon: ['Yaoundé','Douala'],
    Kenya: ['Nairobi','Mombasa'],
    Tanzania: ['Dar es Salaam','Dodoma'],
    Zambia: ['Lusaka','Ndola'],
    Mozambique: ['Maputo','Beira']
  },
  CONCACAF: {
    Mexico: ['Mexico City','Monterrey','Guadalajara','Tijuana'],
    USA: ['New York','Los Angeles','Chicago','Houston','Miami','Seattle','Atlanta','Dallas'],
    Canada: ['Toronto','Montreal','Vancouver'],
    Costa_Rica: ['San Jose','Alajuela'],
    Honduras: ['Tegucigalpa','San Pedro Sula'],
    El_Salvador: ['San Salvador','Santa Ana'],
    Guatemala: ['Guatemala City','Antigua'],
    Panama: ['Panama City','Colón'],
    Jamaica: ['Kingston','Montego Bay'],
    Trinidad_and_Tobago: ['Port of Spain','San Fernando'],
    Haiti: ['Port-au-Prince','Cap-Haïtien'],
    Dominican_Republic: ['Santo Domingo','Santiago de los Caballeros']
  },
  CONMEBOL: {
    Argentina: ['Buenos Aires','Córdoba','Rosario','La Plata'],
    Brazil: ['São Paulo','Rio de Janeiro','Belo Horizonte','Porto Alegre','Curitiba'],
    Uruguay: ['Montevideo','Maldonado'],
    Paraguay: ['Asunción','Ciudad del Este'],
    Chile: ['Santiago','Valparaíso'],
    Peru: ['Lima','Arequipa'],
    Colombia: ['Bogotá','Medellín','Cali','Barranquilla'],
    Ecuador: ['Quito','Guayaquil'],
    Bolivia: ['La Paz','Santa Cruz'],
    Venezuela: ['Caracas','Maracaibo']
  },
  OFC: {
    New_Zealand: ['Auckland','Wellington','Christchurch'],
    Fiji: ['Suva','Nadi'],
    Solomon_Islands: ['Honiara'],
    Papua_New_Guinea: ['Port Moresby','Lae'],
    Tahiti: ['Papeete'],
    New_Caledonia: ['Nouméa'],
    Samoa: ['Apia'],
    Tonga: ['Nukuʻalofa']
  }
};

const prefixes = ['FC','SC','AC','Athletic','Sporting','United','Real','Union','Dynamo','Atletico','Club','Nacional'];
const suffixes = ['United','City','Town','Rovers','Wanderers','CF','AS','Club','Athletico','Stars','Titans','Lions','Academy'];
const stadiums = ['Arena','Stadium','Park','Ground','Coliseum'];
const kits = ['🔴⚪','🔵⚪','🟡⚫','🟢⚪','🟠⚫','⚪⚫','🔴🔵','🔵🟡','🟢🔴','⚫🔵'];

function randomChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function randint(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }

function generateClubs(count: number) {
  const pool: { confed: Confederation; country: Country; city: string }[] = [];
  (Object.keys(CONFEDS) as Confederation[]).forEach(confed => {
    const countries = CONFEDS[confed];
    for (const [country, cities] of Object.entries(countries)) {
      for (const city of cities) pool.push({ confed, country, city });
    }
  });
  const seen = new Set<string>();
  const out: { confed: Confederation; country: Country; club: string; city: string }[] = [];

  let i = 0;
  while (out.length < count) {
    const pick = pool[i % pool.length];
    i++;
    const club = `${randomChoice(prefixes)} ${pick.city} ${randomChoice(suffixes)}`.replace(/\s+/g,' ').trim();
    const key = `${pick.confed}:${pick.country}:${club}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ confed: pick.confed, country: pick.country, club, city: pick.city });
  }
  return out;
}

function buildMarkdown(clubs: { confed: Confederation; country: Country; club: string; city: string }[]) {
  const header = [
    '# FIFA Placeholder Club Data (Non-UEFA)',
    '',
    'Placeholder clubs across FIFA confederations excluding UEFA, for World Club Cup seeding.',
    '',
    '## 2025-2026 Season',
    '',
    '### FIFA Placeholder Pool',
    ''
  ].join('\n');

  const tableHead = '| # | Confederation | Country | Club | City | Stadium | Capacity | Kit (H/A) | Board Expectation | Value | Rep |\n|---|---------------|---------|------|------|---------|----------|-----------|-------------------|-------|-----|';

  const rows = clubs.map((c, idx) => {
    const stadium = `${c.city} ${randomChoice(stadiums)}`;
    const cap = randint(6000, 70000);
    const kit = `${randomChoice(kits)} / ${randomChoice(kits)}`;
    const expect = idx % 18 === 0 ? 'Title Challenge' : (idx % 9 === 0 ? 'Continental Spot' : 'Mid-table');
    const value = `€${randint(1, 700)}M`;
    const rep = '★★☆☆☆';
    return `| ${idx+1} | ${c.confed} | ${c.country} | ${c.club} | ${c.city} | ${stadium} | ${cap} | ${kit} | ${expect} | ${value} | ${rep} |`;
  }).join('\n');

  return `${header}\n${tableHead}\n${rows}\n`;
}

function main() {
  const { count, out } = parseArgs();
  const clubs = generateClubs(count);
  const md = buildMarkdown(clubs);
  const abs = path.isAbsolute(out) ? out : path.join(process.cwd(), out);
  fs.writeFileSync(abs, md, 'utf8');
  console.log(`✅ Wrote ${clubs.length} FIFA placeholder clubs (non-UEFA) to ${out}`);
}

if (require.main === module) {
  main();
}

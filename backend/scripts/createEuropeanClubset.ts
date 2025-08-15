/*
  Create a synthetic European club dataset (~500 clubs) for cup competitions.
  Writes backend/european_clubdata.md in the same table format as backend/clubdata.md sections.
  Usage:
    ts-node scripts/createEuropeanClubset.ts --count 500 --out backend/european_clubdata.md
*/

import fs from 'fs';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (k: string, def?: string) => {
    const i = args.findIndex(a => a === `--${k}`);
    if (i !== -1 && args[i+1]) return args[i+1];
    return def;
  };
  const count = parseInt(get('count', '500')!, 10);
  const out = get('out', 'backend/european_clubdata.md')!;
  return { count, out };
}

const cities = [
  'Amsterdam','Rotterdam','Eindhoven','Utrecht','Groningen','Brussels','Antwerp','Ghent','Bruges','Liege',
  'Paris','Lyon','Marseille','Lille','Nice','Madrid','Barcelona','Valencia','Seville','Bilbao',
  'Lisbon','Porto','Braga','Coimbra','Faro','London','Manchester','Liverpool','Birmingham','Leeds',
  'Glasgow','Edinburgh','Dublin','Cork','Belfast','Berlin','Munich','Dortmund','Leipzig','Frankfurt',
  'Milan','Rome','Turin','Naples','Florence','Venice','Athens','Thessaloniki','Istanbul','Ankara',
  'Copenhagen','Aarhus','Stockholm','Gothenburg','Malmo','Oslo','Bergen','Helsinki','Tampere','Reykjavik',
  'Zurich','Geneva','Basel','Bern','Vienna','Salzburg','Prague','Brno','Warsaw','Krakow',
  'Gdansk','Poznan','Budapest','Bucharest','Cluj','Sofia','Plovdiv','Belgrade','Zagreb','Ljubljana',
  'Sarajevo','Skopje','Tirana','Podgorica','Bratislava','Luxembourg','Monaco','San Marino','Andorra la Vella','Tallinn',
  'Riga','Vilnius','Kyiv','Lviv','Odessa','Chisinau','Valletta','Porto Santo','Madeira','Las Palmas'
];

const prefixes = [
  'FC','SC','AC','Athletic','Sporting','Real','Union','Dynamo','Rapid','Lokomotiv','Victoria','Sparta','Partizan','Racing','Standard','Young Boys','Grasshopper','Red Star','Metalist','Shakhtar'
];

const suffixes = [
  'United','City','Town','Rovers','Wanderers','Athletica','Calcio','CF','FK','BK','IF','SK','AS','SV','Olympic','Phoenix','Titans','Giants','Academy','1910','1905','1899'
];

const stadiumNames = ['Arena','Stadium','Park','Ground','Coliseum','Dome','Field','Sportpark','Stadion','Arena Nova'];

function randomChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function randomCap(n: number, m: number) { return Math.floor(Math.random()*(m-n+1))+n; }

function uniqueClubNames(n: number): { club: string; city: string }[] {
  const set = new Set<string>();
  const out: { club: string; city: string }[] = [];
  let attempts = 0;
  while (out.length < n && attempts < n*50) {
    const city = randomChoice(cities);
    const name = `${randomChoice(prefixes)} ${city} ${randomChoice(suffixes)}`.replace(/\s+/g,' ').trim();
    if (!set.has(name)) { set.add(name); out.push({ club: name, city }); }
    attempts++;
  }
  // fallback simple names if needed
  while (out.length < n) {
    const city = randomChoice(cities);
    const name = `${randomChoice(prefixes)} ${city} ${out.length}`;
    if (!set.has(name)) { set.add(name); out.push({ club: name, city }); }
  }
  return out;
}

function buildTableRows(entries: { club: string; city: string }[]) {
  const header = '| # | Club | City | Stadium | Capacity | Kit (H/A) | Board Expectation | Value | Rep |\n|---|------|------|---------|----------|-----------|-------------------|-------|-----|';
  const kits = ['🔴⚪','🔵⚪','🟡⚫','🟢⚪','🟠⚫','⚪⚫','🔴🔵','🔵🟡','🟢🔴','⚫🔵'];
  const rows = entries.map((e, i) => {
    const stadium = `${e.city} ${randomChoice(stadiumNames)}`;
    const cap = randomCap(5000, 60000);
    const kit = `${randomChoice(kits)} / ${randomChoice(kits)}`;
    const expect = i % 20 === 0 ? 'Title Challenge' : (i % 10 === 0 ? 'European Spot' : 'Mid-table');
    const value = `€${(randomCap(1, 600))}M`;
    const rep = '★★☆☆☆';
    return `| ${i+1} | ${e.club} | ${e.city} | ${stadium} | ${cap} | ${kit} | ${expect} | ${value} | ${rep} |`;
  }).join('\n');
  return `${header}\n${rows}`;
}

function writeEuropeanClubData(count: number, outPath: string) {
  const clubs = uniqueClubNames(count);
  const content: string[] = [];
  content.push('# European Club Data');
  content.push('');
  content.push('This file lists synthetic European clubs for international cup competitions.');
  content.push('');
  content.push('## 2025-2026 Season');
  content.push('');
  content.push('### UEFA European Pool');
  content.push(buildTableRows(clubs));
  content.push('');
  content.push('### FIFA Club Pool');
  content.push('Notes: A subset of UEFA pool clubs can be selected for Club World Cup draws.');

  const abs = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  fs.writeFileSync(abs, content.join('\n'), 'utf8');
  console.log(`✅ Wrote ${count} European clubs to ${outPath}`);
}

function main() {
  const { count, out } = parseArgs();
  writeEuropeanClubData(count, out);
}

if (require.main === module) {
  main();
}

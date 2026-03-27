import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper to determine board expectation based on position
function getBoardExpectation(position: number): string {
  if (position === 1) return 'Win the league';
  if (position <= 3) return 'Promotion challenge';
  if (position <= 7) return 'Top half finish';
  if (position <= 11) return 'Mid-table';
  return 'Avoid relegation';
}

// Helper to generate kit colors (simple mapping for demo)
function getKitColors(clubName: string) {
  // You can expand this mapping for realism
  const colors: Record<string, { shirt: string; shorts: string; socks: string }> = {
    'VV Zwanenburg': { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' },
    'Blauw Wit W': { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' },
    'De Wherevogels': { shirt: '#008000', shorts: '#ffffff', socks: '#008000' },
    'ZCFC': { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' },
    'SV DTS': { shirt: '#ff8800', shorts: '#000000', socks: '#ff8800' },
    'VV Opperdoes': { shirt: '#800080', shorts: '#ffffff', socks: '#800080' },
    'De Blokkers': { shirt: '#00ffff', shorts: '#000000', socks: '#00ffff' },
    'Sporting Krommenie': { shirt: '#ff00ff', shorts: '#ffffff', socks: '#ff00ff' },
    'Wieringermeer': { shirt: '#008080', shorts: '#ffffff', socks: '#008080' },
    'ASC De Volewijckers': { shirt: '#c0c0c0', shorts: '#000000', socks: '#c0c0c0' },
    'SC Purmerland': { shirt: '#ffa500', shorts: '#000000', socks: '#ffa500' },
    'VV Jisp': { shirt: '#a52a2a', shorts: '#ffffff', socks: '#a52a2a' },
    'SV Koedijk': { shirt: '#000000', shorts: '#ffffff', socks: '#000000' },
    'SV Kadoelen': { shirt: '#808080', shorts: '#ffffff', socks: '#808080' },
    // Add more as needed
  };
  return colors[clubName] || { shirt: '#cccccc', shorts: '#ffffff', socks: '#cccccc' };
}

// Helper to assign home city (demo mapping)
function getHomeCity(clubName: string): string {
  const cities: Record<string, string> = {
    'VV Zwanenburg': 'Zwanenburg',
    'Blauw Wit W': 'Amsterdam',
    'De Wherevogels': 'Purmerend',
    'ZCFC': 'Zaandam',
    'SV DTS': 'Oosthuizen',
    'VV Opperdoes': 'Opperdoes',
    'De Blokkers': 'Blokker',
    'Sporting Krommenie': 'Krommenie',
    'Wieringermeer': 'Slootdorp',
    'ASC De Volewijckers': 'Amsterdam',
    'SC Purmerland': 'Purmerland',
    'VV Jisp': 'Jisp',
    'SV Koedijk': 'Koedijk',
    'SV Kadoelen': 'Amsterdam',
    // Add more as needed
  };
  return cities[clubName] || 'Unknown';
}

async function main() {
  // Example for Vijfde Klasse A (repeat for B-E)
  const leagueA = await prisma.league.create({
    data: {
      name: 'Vijfde Klasse A',
      region: 'West 1',
      division: 'Vijfde Klasse',
      tier: 'AMATEUR',
      season: '2023/2024',
      clubs: {
        create: [
          { name: 'VV Zwanenburg', city: getHomeCity('VV Zwanenburg'), boardExpectation: getBoardExpectation(1), primaryColor: getKitColors('VV Zwanenburg').shirt, homeKitShorts: getKitColors('VV Zwanenburg').shorts, homeKitSocks: getKitColors('VV Zwanenburg').socks, morale: 90, form: 'WWWWW' },
          { name: 'Blauw Wit W', city: getHomeCity('Blauw Wit W'), boardExpectation: getBoardExpectation(2), primaryColor: getKitColors('Blauw Wit W').shirt, homeKitShorts: getKitColors('Blauw Wit W').shorts, homeKitSocks: getKitColors('Blauw Wit W').socks, morale: 88, form: 'WWWDW' },
          // ...repeat for all clubs, using stats for morale/form
        ]
      }
    }
  });
  // Repeat for B, C, D, E with their clubs and stats
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function getBoardExpectation(position: number): string {
  if (position === 1) return 'Win the league';
  if (position <= 3) return 'Promotion challenge';
  if (position <= 7) return 'Top half finish';
  if (position <= 11) return 'Mid-table';
  return 'Avoid relegation';
}

function getKitColors(clubName: string) {
  const colors: Record<string, { shirt: string; shorts: string; socks: string }> = {
    'Zondag Club 1': { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' },
    'Zondag Club 2': { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' },
    'Zondag Club 3': { shirt: '#008000', shorts: '#ffffff', socks: '#008000' },
    'Zondag Club 4': { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' },
    'Zondag Club 5': { shirt: '#ff8800', shorts: '#000000', socks: '#ff8800' },
    // Add more as needed
  };
  return colors[clubName] || { shirt: '#cccccc', shorts: '#ffffff', socks: '#cccccc' };
}

function getHomeCity(clubName: string): string {
  const cities: Record<string, string> = {
    'Zondag Club 1': 'Amsterdam',
    'Zondag Club 2': 'Haarlem',
    'Zondag Club 3': 'Zaandam',
    'Zondag Club 4': 'Hoorn',
    'Zondag Club 5': 'Purmerend',
    // Add more as needed
  };
  return cities[clubName] || 'Unknown';
}

async function main() {
  // Example for Vijfde Klasse A (repeat for B-E)
  for (const suffix of ['A', 'B', 'C', 'D', 'E']) {
    await prisma.league.create({
      data: {
        name: `Vijfde Klasse ${suffix}`,
        region: 'West 1',
        division: 'Vijfde Klasse',
        tier: 'AMATEUR',
        season: '2023/2024',
        // Optionally: add a dayType: 'Zondag' field if your model supports it
        clubs: {
          create: Array.from({ length: 14 }, (_, i) => {
            const clubName = `Zondag Club ${i + 1} (${suffix})`;
            return {
              name: clubName,
              city: getHomeCity(`Zondag Club ${i + 1}`),
              boardExpectation: getBoardExpectation(i + 1),
              primaryColor: getKitColors(`Zondag Club ${i + 1}`).shirt,
              homeKitShorts: getKitColors(`Zondag Club ${i + 1}`).shorts,
              homeKitSocks: getKitColors(`Zondag Club ${i + 1}`).socks,
              morale: 70 + (14 - i) * 1.5, // Higher for top clubs
              form: i < 3 ? 'WWWWW' : i < 7 ? 'WWLWD' : 'LLLDL',
            };
          })
        }
      }
    });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 
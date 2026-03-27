import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';


// Example: Real player lists for some clubs (expand as needed)
const realPlayers: Record<string, string[]> = {
  'AFC Ajax': [
    'Gerónimo Rulli', 'Devyne Rensch', 'Jorrel Hato', 'Steven Berghuis', 'Brian Brobbey',
    'Steven Bergwijn', 'Branco van den Boomen', 'Benjamin Tahirović', 'Josip Šutalo',
    'Carlos Forbs', 'Jordan Henderson', 'Chuba Akpom', 'Kristian Hlynsson', 'Owen Wijndal',
    'Jay Gorter', 'Silvano Vos', 'Anass Salah-Eddine', 'Ahmetcan Kaplan', 'Tristan Gooijer',
    'Kian Fitz-Jim', 'Remko Pasveer', 'Youri Baas', 'Mika Godts', 'Jorge Sánchez', 'Francisco Conceição'
  ],
  // Add more clubs and real player lists here as needed
};

async function main() {
  const clubs = await prisma.club.findMany();
  for (const club of clubs) {
    const players = await prisma.player.findMany({ where: { clubId: club.id } });
    if (players.length >= 25) continue;
    let usedReal = 0;
    // Use real player list if available
    if (realPlayers[club.name]) {
      const existingNames = new Set(players.map(p => p.name));
      for (const name of realPlayers[club.name]) {
        if (existingNames.has(name)) continue;
        await prisma.player.create({
          data: {
            name,
            clubId: club.id,
            position: 'MID', // Default, can be improved with real data
            skill: 70,
            age: 24,
            nationality: 'Netherlands',
            morale: 75,
            injured: false,
            internationalCaps: 0,
            onInternationalDuty: false,
            wage: 5000,
            contractExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            personality: 'PROFESSIONAL'
          }
        });
        usedReal++;
        if (players.length + usedReal >= 25) break;
      }
    }
    // Fill the rest with generated players
    const toGenerate = 25 - (players.length + usedReal);
    if (toGenerate > 0) {
      for (let i = 0; i < toGenerate; i++) {
        await generatePlayersForClub(prisma, club.id);
      }
    }
    console.log(`Filled club ${club.name}: ${usedReal} real, ${toGenerate > 0 ? toGenerate : 0} generated players.`);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); }); 
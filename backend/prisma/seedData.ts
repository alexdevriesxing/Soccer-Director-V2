import { generateSquadFillers } from '../src/utils/dutchNameGenerator';

// Real players for Eredivisie clubs (2024-25 season)
const eredivisieRealPlayers = {
  'Ajax': [
    { name: 'Brian Brobbey', position: 'ST', skill: 85, age: 22, nationality: 'Netherlands', internationalCaps: 2 },
    { name: 'Steven Bergwijn', position: 'LW', skill: 82, age: 26, nationality: 'Netherlands', internationalCaps: 31 },
    { name: 'Steven Berghuis', position: 'RW', skill: 80, age: 32, nationality: 'Netherlands', internationalCaps: 45 },
    { name: 'Jorrel Hato', position: 'CB', skill: 78, age: 18, nationality: 'Netherlands', internationalCaps: 1 },
    { name: 'Diant Ramaj', position: 'GK', skill: 77, age: 22, nationality: 'Germany', internationalCaps: 0 },
    { name: 'Branco van den Boomen', position: 'CM', skill: 77, age: 28, nationality: 'Netherlands', internationalCaps: 0 },
    { name: 'Kenneth Taylor', position: 'CM', skill: 76, age: 22, nationality: 'Netherlands', internationalCaps: 5 },
    { name: 'Devyne Rensch', position: 'RB', skill: 76, age: 21, nationality: 'Netherlands', internationalCaps: 3 },
    { name: 'Ahmetcan Kaplan', position: 'CB', skill: 75, age: 21, nationality: 'Turkey', internationalCaps: 0 },
    { name: 'Benjamin Tahirović', position: 'CDM', skill: 75, age: 21, nationality: 'Bosnia and Herzegovina', internationalCaps: 10 },
    { name: 'Silvano Vos', position: 'CDM', skill: 74, age: 19, nationality: 'Netherlands', internationalCaps: 0 },
    { name: 'Gastón Ávila', position: 'LB', skill: 74, age: 22, nationality: 'Argentina', internationalCaps: 0 },
    { name: 'Anton Gaaei', position: 'RB', skill: 73, age: 21, nationality: 'Denmark', internationalCaps: 0 },
    { name: 'Chuba Akpom', position: 'ST', skill: 73, age: 28, nationality: 'England', internationalCaps: 0 },
    { name: 'Carlos Forbs', position: 'RW', skill: 72, age: 20, nationality: 'Portugal', internationalCaps: 0 },
  ],
  'PSV': [
    { name: 'Luuk de Jong', position: 'ST', skill: 86, age: 33, nationality: 'Netherlands', internationalCaps: 39 },
    { name: 'Johan Bakayoko', position: 'RW', skill: 82, age: 21, nationality: 'Belgium', internationalCaps: 12 },
    { name: 'Joey Veerman', position: 'CM', skill: 81, age: 25, nationality: 'Netherlands', internationalCaps: 7 },
    { name: 'Walter Benítez', position: 'GK', skill: 80, age: 31, nationality: 'Argentina', internationalCaps: 1 },
    { name: 'Olivier Boscagli', position: 'CB', skill: 79, age: 26, nationality: 'France', internationalCaps: 0 },
    { name: 'Ismael Saibari', position: 'CAM', skill: 78, age: 23, nationality: 'Morocco', internationalCaps: 5 },
    { name: 'André Ramalho', position: 'CB', skill: 78, age: 32, nationality: 'Brazil', internationalCaps: 0 },
    { name: 'Mauro Júnior', position: 'LB', skill: 77, age: 25, nationality: 'Brazil', internationalCaps: 0 },
    { name: 'Patrick van Aanholt', position: 'LB', skill: 77, age: 33, nationality: 'Netherlands', internationalCaps: 19 },
    { name: 'Guus Til', position: 'CAM', skill: 76, age: 26, nationality: 'Netherlands', internationalCaps: 5 },
    { name: 'Malik Tillman', position: 'CM', skill: 76, age: 22, nationality: 'USA', internationalCaps: 6 },
    { name: 'Jordan Teze', position: 'RB', skill: 75, age: 24, nationality: 'Netherlands', internationalCaps: 2 },
    { name: 'Hirving Lozano', position: 'LW', skill: 80, age: 28, nationality: 'Mexico', internationalCaps: 68 },
    { name: 'Ricardo Pepi', position: 'ST', skill: 74, age: 21, nationality: 'USA', internationalCaps: 21 },
    { name: 'Shurandy Sambo', position: 'RB', skill: 73, age: 22, nationality: 'Netherlands', internationalCaps: 0 },
    { name: 'Armando Obispo', position: 'CB', skill: 72, age: 25, nationality: 'Netherlands', internationalCaps: 0 },
    { name: 'Yorbe Vertessen', position: 'RW', skill: 72, age: 23, nationality: 'Belgium', internationalCaps: 0 },
    { name: 'Fredrik Oppegård', position: 'LB', skill: 71, age: 22, nationality: 'Norway', internationalCaps: 2 },
    { name: 'Dirk Proper', position: 'CM', skill: 71, age: 22, nationality: 'Netherlands', internationalCaps: 0 },
  ],
  'Feyenoord': [
    { name: 'Santiago Giménez', position: 'ST', skill: 85, age: 23, nationality: 'Mexico', internationalCaps: 27 },
    { name: 'Calvin Stengs', position: 'RW', skill: 81, age: 25, nationality: 'Netherlands', internationalCaps: 11 },
    { name: 'Mats Wieffer', position: 'CM', skill: 80, age: 24, nationality: 'Netherlands', internationalCaps: 7 },
    { name: 'David Hancko', position: 'CB', skill: 82, age: 26, nationality: 'Slovakia', internationalCaps: 35 },
    { name: 'Justin Bijlow', position: 'GK', skill: 80, age: 26, nationality: 'Netherlands', internationalCaps: 8 },
    { name: 'Quinten Timber', position: 'CM', skill: 79, age: 22, nationality: 'Netherlands', internationalCaps: 2 },
    { name: 'Lutsharel Geertruida', position: 'RB', skill: 78, age: 23, nationality: 'Netherlands', internationalCaps: 7 },
    { name: 'Gernot Trauner', position: 'CB', skill: 77, age: 32, nationality: 'Austria', internationalCaps: 10 },
    { name: 'Igor Paixão', position: 'LW', skill: 77, age: 24, nationality: 'Brazil', internationalCaps: 0 },
    { name: 'Alireza Jahanbakhsh', position: 'RW', skill: 76, age: 30, nationality: 'Iran', internationalCaps: 70 },
    { name: 'Bart Nieuwkoop', position: 'RB', skill: 75, age: 28, nationality: 'Netherlands', internationalCaps: 0 },
    { name: 'Thomas Beelen', position: 'CB', skill: 75, age: 23, nationality: 'Netherlands', internationalCaps: 0 },
    { name: 'Yankuba Minteh', position: 'RW', skill: 74, age: 19, nationality: 'Gambia', internationalCaps: 5 },
    { name: 'Ondrej Lingr', position: 'CAM', skill: 74, age: 25, nationality: 'Czech Republic', internationalCaps: 3 },
    { name: 'Marcos López', position: 'LB', skill: 73, age: 24, nationality: 'Peru', internationalCaps: 20 },
    { name: 'Danilo', position: 'ST', skill: 73, age: 25, nationality: 'Brazil', internationalCaps: 0 },
    { name: 'Timon Wellenreuther', position: 'GK', skill: 72, age: 28, nationality: 'Germany', internationalCaps: 0 },
    { name: 'Antoni Milambo', position: 'CM', skill: 71, age: 19, nationality: 'Netherlands', internationalCaps: 0 },
    { name: 'Quilindschy Hartman', position: 'LB', skill: 71, age: 22, nationality: 'Netherlands', internationalCaps: 2 },
  ]
};

// Helper function to create complete squad with AI fillers
function createCompleteSquad(realPlayers: any[], clubName: string) {
  const fillers = generateSquadFillers(realPlayers, 25);
  return [...realPlayers, ...fillers];
}

export const leagues = [
  {
    name: 'Eredivisie',
    tier: 'EREDIVISIE',
    season: '2024-2025',
    clubs: [
      {
        name: 'Ajax',
        homeCity: 'Amsterdam',
        boardExpectation: 'Win the league',
        players: createCompleteSquad(eredivisieRealPlayers['Ajax'], 'Ajax')
      },
      {
        name: 'PSV',
        homeCity: 'Eindhoven',
        boardExpectation: 'Win the league',
        players: createCompleteSquad(eredivisieRealPlayers['PSV'], 'PSV')
      },
      {
        name: 'Feyenoord',
        homeCity: 'Rotterdam',
        boardExpectation: 'Win the league',
        players: createCompleteSquad(eredivisieRealPlayers['Feyenoord'], 'Feyenoord')
      },
      // Add more Eredivisie clubs with real players + AI fillers
      {
        name: 'AZ',
        homeCity: 'Alkmaar',
        boardExpectation: 'Qualify for Europe',
        players: createCompleteSquad([
          { name: 'Vangelis Pavlidis', position: 'ST', skill: 83, age: 25, nationality: 'Greece', internationalCaps: 36 },
          { name: 'Jordy Clasie', position: 'CM', skill: 78, age: 33, nationality: 'Netherlands', internationalCaps: 17 },
          { name: 'Yukinari Sugawara', position: 'RB', skill: 77, age: 24, nationality: 'Japan', internationalCaps: 7 },
          { name: 'Mathew Ryan', position: 'GK', skill: 78, age: 32, nationality: 'Australia', internationalCaps: 90 },
          { name: 'Dani de Wit', position: 'CAM', skill: 77, age: 26, nationality: 'Netherlands', internationalCaps: 0 },
          { name: 'Bruno Martins Indi', position: 'CB', skill: 76, age: 32, nationality: 'Netherlands', internationalCaps: 36 },
          { name: 'Mayckel Lahdo', position: 'LW', skill: 75, age: 21, nationality: 'Sweden', internationalCaps: 2 },
          { name: 'Riechedly Bazoer', position: 'CB', skill: 75, age: 27, nationality: 'Netherlands', internationalCaps: 6 },
          { name: 'Sven Mijnans', position: 'CM', skill: 74, age: 23, nationality: 'Netherlands', internationalCaps: 0 },
          { name: 'Mees de Wit', position: 'LB', skill: 74, age: 25, nationality: 'Netherlands', internationalCaps: 0 },
          { name: 'Sam Beukema', position: 'CB', skill: 73, age: 25, nationality: 'Netherlands', internationalCaps: 0 },
          { name: 'Jens Odgaard', position: 'ST', skill: 73, age: 24, nationality: 'Denmark', internationalCaps: 0 },
          { name: 'Tiago Dantas', position: 'CM', skill: 72, age: 23, nationality: 'Portugal', internationalCaps: 0 },
          { name: 'Ruben van Bommel', position: 'RW', skill: 72, age: 20, nationality: 'Netherlands', internationalCaps: 0 },
          { name: 'Wouter Goes', position: 'CB', skill: 71, age: 19, nationality: 'Netherlands', internationalCaps: 0 },
        ], 'AZ')
      },
      // Continue with other Eredivisie clubs...
    ]
  },
  // Continue with other leagues...
]; 
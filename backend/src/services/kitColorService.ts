import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface KitColors {
  shirt: string;
  shorts: string;
  socks: string;
}

export interface TeamKits {
  home: KitColors;
  away: KitColors;
}

export class KitColorService {
  // Dutch club kit colors (based on real clubs)
  private static readonly DUTCH_CLUB_KITS: Record<string, TeamKits> = {
    'Ajax': {
      home: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }, // White with red trim
      away: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' }   // Red
    },
    'PSV': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Feyenoord': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'AZ': {
      home: { shirt: '#000000', shorts: '#000000', socks: '#000000' },  // Black
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Utrecht': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Vitesse': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Heerenveen': {
      home: { shirt: '#0000ff', shorts: '#0000ff', socks: '#0000ff' },  // Blue
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Groningen': {
      home: { shirt: '#00ff00', shorts: '#00ff00', socks: '#00ff00' },  // Green
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Twente': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Heracles': {
      home: { shirt: '#ffffff', shorts: '#000000', socks: '#ffffff' },  // White/Black
      away: { shirt: '#000000', shorts: '#ffffff', socks: '#000000' }   // Black/White
    },
    'Volendam': {
      home: { shirt: '#ff6600', shorts: '#ff6600', socks: '#ff6600' },  // Orange
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Almere': {
      home: { shirt: '#ffffff', shorts: '#e30613', socks: '#ffffff' },  // White/Red
      away: { shirt: '#e30613', shorts: '#ffffff', socks: '#e30613' }   // Red/White
    },
    'Excelsior': {
      home: { shirt: '#ffffff', shorts: '#e30613', socks: '#ffffff' },  // White/Red
      away: { shirt: '#e30613', shorts: '#ffffff', socks: '#e30613' }   // Red/White
    },
    'Fortuna': {
      home: { shirt: '#ffffff', shorts: '#009a44', socks: '#ffffff' },  // White/Green
      away: { shirt: '#009a44', shorts: '#ffffff', socks: '#009a44' }   // Green/White
    },
    'Waalwijk': {
      home: { shirt: '#ffcc00', shorts: '#005bac', socks: '#ffcc00' },  // Yellow/Blue
      away: { shirt: '#005bac', shorts: '#ffcc00', socks: '#005bac' }   // Blue/Yellow
    },
    // Derde Divisie A teams
    'Ajax (amateurs)': {
      home: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' },  // White with red trim
      away: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' }   // Red
    },
    'RKVV DEM': {
      home: { shirt: '#0000ff', shorts: '#0000ff', socks: '#0000ff' },  // Blue
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'DOVO': {
      home: { shirt: '#ff6600', shorts: '#ff6600', socks: '#ff6600' },  // Orange
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    "DVS '33 Ermelo": {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'VV Eemdijk': {
      home: { shirt: '#00ff00', shorts: '#00ff00', socks: '#00ff00' },  // Green
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    "Excelsior '31": {
      home: { shirt: '#ffffff', shorts: '#e30613', socks: '#ffffff' },  // White/Red
      away: { shirt: '#e30613', shorts: '#ffffff', socks: '#e30613' }   // Red/White
    },
    'SC Genemuiden': {
      home: { shirt: '#0000ff', shorts: '#0000ff', socks: '#0000ff' },  // Blue
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Harkemase Boys': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'HBC': {
      home: { shirt: '#0000ff', shorts: '#0000ff', socks: '#0000ff' },  // Blue
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'USV Hercules': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    "HSC '21": {
      home: { shirt: '#00ff00', shorts: '#00ff00', socks: '#00ff00' },  // Green
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'SV Huizen': {
      home: { shirt: '#ffff00', shorts: '#ffff00', socks: '#ffff00' },  // Yellow
      away: { shirt: '#000000', shorts: '#000000', socks: '#000000' }   // Black
    },
    'IJsselmeervogels': {
      home: { shirt: '#ff6600', shorts: '#ff6600', socks: '#ff6600' },  // Orange
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Rohda Raalte': {
      home: { shirt: '#0000ff', shorts: '#0000ff', socks: '#0000ff' },  // Blue
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'Sparta Nijkerk': {
      home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' },  // Red
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    "Sportlust '46": {
      home: { shirt: '#00ff00', shorts: '#00ff00', socks: '#00ff00' },  // Green
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'TEC': {
      home: { shirt: '#ff00ff', shorts: '#ff00ff', socks: '#ff00ff' },  // Magenta
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    'SV Urk': {
      home: { shirt: '#ff6600', shorts: '#ff6600', socks: '#ff6600' },  // Orange
      away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' }   // White
    },
    // Derde Divisie B teams
    'ASWH': {
      home: { shirt: '#ffffff', shorts: '#000000', socks: '#ffffff' }, // White/Black
      away: { shirt: '#000000', shorts: '#ffffff', socks: '#000000' } // Black/White
    },
    "Blauw Geel '38": {
      home: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' }, // Blue/Yellow
      away: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' } // Yellow/Blue
    },
    'FC Lisse': {
      home: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' }, // Yellow/Blue
      away: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' } // Blue/Yellow
    },
    'VV Gemert': {
      home: { shirt: '#000000', shorts: '#ffffff', socks: '#000000' }, // Black/White
      away: { shirt: '#ffffff', shorts: '#000000', socks: '#ffffff' } // White/Black
    },
    'VV GOES': {
      home: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' }, // White/Blue
      away: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' } // Blue/White
    },
    'HSV Hoek': {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'VV Kloetinge': {
      home: { shirt: '#00ff00', shorts: '#ffffff', socks: '#00ff00' }, // Green/White
      away: { shirt: '#ffffff', shorts: '#00ff00', socks: '#ffffff' } // White/Green
    },
    'Kozakken Boys': {
      home: { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' }, // Red/White
      away: { shirt: '#ffffff', shorts: '#ff0000', socks: '#ffffff' } // White/Red
    },
    'SV Meerssen': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'OJC Rosmalen': {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'Quick (H)': {
      home: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' }, // White/Blue
      away: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' } // Blue/White
    },
    'FC Rijnvogels': {
      home: { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' }, // Red/White
      away: { shirt: '#ffffff', shorts: '#ff0000', socks: '#ffffff' } // White/Red
    },
    "FC 's-Gravenzande": {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'VV Smitshoek': {
      home: { shirt: '#ff6600', shorts: '#000000', socks: '#ff6600' }, // Orange/Black
      away: { shirt: '#000000', shorts: '#ff6600', socks: '#000000' } // Black/Orange
    },
    'SteDoCo': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'TOGB': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'UNA': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'VVSB': {
      home: { shirt: '#800080', shorts: '#ffffff', socks: '#800080' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#800080', socks: '#ffffff' } // White/Purple
    },
    // Vierde Divisie A teams
    "AFC '34": {
      home: { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' }, // Red/White
      away: { shirt: '#ffffff', shorts: '#ff0000', socks: '#ffffff' } // White/Red
    },
    'DVVA': {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'HVV Hollandia': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'VV Hoogland': {
      home: { shirt: '#00ff00', shorts: '#ffffff', socks: '#00ff00' }, // Green/White
      away: { shirt: '#ffffff', shorts: '#00ff00', socks: '#ffffff' } // White/Green
    },
    'JOS Watergraafsmeer': {
      home: { shirt: '#ff6600', shorts: '#000000', socks: '#ff6600' }, // Orange/Black
      away: { shirt: '#000000', shorts: '#ff6600', socks: '#000000' } // Black/Orange
    },
    'SV Kampong': {
      home: { shirt: '#000000', shorts: '#ffffff', socks: '#000000' }, // Black/White
      away: { shirt: '#ffffff', shorts: '#000000', socks: '#ffffff' } // White/Black
    },
    'VV Kolping Boys': {
      home: { shirt: '#800080', shorts: '#ffffff', socks: '#800080' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#800080', socks: '#ffffff' } // White/Purple
    },
    "ODIN '59": {
      home: { shirt: '#ff00ff', shorts: '#000000', socks: '#ff00ff' }, // Magenta/Black
      away: { shirt: '#000000', shorts: '#ff00ff', socks: '#000000' } // Black/Magenta
    },
    'VPV Purmersteijn': {
      home: { shirt: '#00ffff', shorts: '#000000', socks: '#00ffff' }, // Cyan/Black
      away: { shirt: '#000000', shorts: '#00ffff', socks: '#000000' } // Black/Cyan
    },
    'VV Scherpenzeel': {
      home: { shirt: '#ff8800', shorts: '#ffffff', socks: '#ff8800' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff8800', socks: '#ffffff' } // White/Orange
    },
    'SDV Barneveld': {
      home: { shirt: '#8800ff', shorts: '#ffffff', socks: '#8800ff' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#8800ff', socks: '#ffffff' } // White/Purple
    },
    'SJC': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'AVV Swift': {
      home: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' }, // Blue/Yellow
      away: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' } // Yellow/Blue
    },
    'Ter Leede': {
      home: { shirt: '#00ff00', shorts: '#000000', socks: '#00ff00' }, // Green/Black
      away: { shirt: '#000000', shorts: '#00ff00', socks: '#000000' } // Black/Green
    },
    'VVOG': {
      home: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' }, // Yellow/Blue
      away: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' } // Blue/Yellow
    },
    'HSV De Zuidvogels': {
      home: { shirt: '#ff6600', shorts: '#ffffff', socks: '#ff6600' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff6600', socks: '#ffffff' } // White/Orange
    },
    // Vierde Divisie B teams
    'VV Barendrecht': {
      home: { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' }, // Red/White
      away: { shirt: '#ffffff', shorts: '#ff0000', socks: '#ffffff' } // White/Red
    },
    'VV Capelle': {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'VV Delfshaven': {
      home: { shirt: '#00ff00', shorts: '#000000', socks: '#00ff00' }, // Green/Black
      away: { shirt: '#000000', shorts: '#00ff00', socks: '#000000' } // Black/Green
    },
    'VV Feijenoord': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'VV Gouda': {
      home: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' }, // Yellow/Blue
      away: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' } // Blue/Yellow
    },
    'VV Hillegersberg': {
      home: { shirt: '#ff6600', shorts: '#ffffff', socks: '#ff6600' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff6600', socks: '#ffffff' } // White/Orange
    },
    'VV IJsselmonde': {
      home: { shirt: '#800080', shorts: '#ffffff', socks: '#800080' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#800080', socks: '#ffffff' } // White/Purple
    },
    'VV Krimpen': {
      home: { shirt: '#ff00ff', shorts: '#000000', socks: '#ff00ff' }, // Magenta/Black
      away: { shirt: '#000000', shorts: '#ff00ff', socks: '#000000' } // Black/Magenta
    },
    'VV Lekkerkerk': {
      home: { shirt: '#00ffff', shorts: '#000000', socks: '#00ffff' }, // Cyan/Black
      away: { shirt: '#000000', shorts: '#00ffff', socks: '#000000' } // Black/Cyan
    },
    'VV Nieuwerkerk': {
      home: { shirt: '#ff8800', shorts: '#ffffff', socks: '#ff8800' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff8800', socks: '#ffffff' } // White/Orange
    },
    'VV Oud-Beijerland': {
      home: { shirt: '#8800ff', shorts: '#ffffff', socks: '#8800ff' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#8800ff', socks: '#ffffff' } // White/Purple
    },
    'VV Papendrecht': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'VV Ridderkerk': {
      home: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' }, // Blue/Yellow
      away: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' } // Yellow/Blue
    },
    'VV Schiedam': {
      home: { shirt: '#00ff00', shorts: '#ffffff', socks: '#00ff00' }, // Green/White
      away: { shirt: '#ffffff', shorts: '#00ff00', socks: '#ffffff' } // White/Green
    },
    'VV Spijkenisse': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'VV Vlaardingen': {
      home: { shirt: '#ff6600', shorts: '#000000', socks: '#ff6600' }, // Orange/Black
      away: { shirt: '#000000', shorts: '#ff6600', socks: '#000000' } // Black/Orange
    },
    // Vierde Divisie C teams
    'VV Almelo': {
      home: { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' }, // Red/White
      away: { shirt: '#ffffff', shorts: '#ff0000', socks: '#ffffff' } // White/Red
    },
    'VV Borne': {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'VV Deventer': {
      home: { shirt: '#00ff00', shorts: '#000000', socks: '#00ff00' }, // Green/Black
      away: { shirt: '#000000', shorts: '#00ff00', socks: '#000000' } // Black/Green
    },
    'VV Enschede': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'VV Goor': {
      home: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' }, // Yellow/Blue
      away: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' } // Blue/Yellow
    },
    'VV Haaksbergen': {
      home: { shirt: '#ff6600', shorts: '#ffffff', socks: '#ff6600' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff6600', socks: '#ffffff' } // White/Orange
    },
    'VV Hengelo': {
      home: { shirt: '#800080', shorts: '#ffffff', socks: '#800080' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#800080', socks: '#ffffff' } // White/Purple
    },
    'VV Holten': {
      home: { shirt: '#ff00ff', shorts: '#000000', socks: '#ff00ff' }, // Magenta/Black
      away: { shirt: '#000000', shorts: '#ff00ff', socks: '#000000' } // Black/Magenta
    },
    'VV Kampen': {
      home: { shirt: '#00ffff', shorts: '#000000', socks: '#00ffff' }, // Cyan/Black
      away: { shirt: '#000000', shorts: '#00ffff', socks: '#000000' } // Black/Cyan
    },
    'VV Losser': {
      home: { shirt: '#ff8800', shorts: '#ffffff', socks: '#ff8800' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff8800', socks: '#ffffff' } // White/Orange
    },
    'VV Norg': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'VV Oosterwolde': {
      home: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' }, // Blue/Yellow
      away: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' } // Yellow/Blue
    },
    'VV Roden': {
      home: { shirt: '#00ff00', shorts: '#ffffff', socks: '#00ff00' }, // Green/White
      away: { shirt: '#ffffff', shorts: '#00ff00', socks: '#ffffff' } // White/Green
    },
    'VV Stadskanaal': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'VV Veendam': {
      home: { shirt: '#ff6600', shorts: '#000000', socks: '#ff6600' }, // Orange/Black
      away: { shirt: '#000000', shorts: '#ff6600', socks: '#0000ff' } // Black/Orange
    },
    // Eerste Klasse A clubs
    'SV Hoofddorp': {
      home: { shirt: '#ff0000', shorts: '#ffffff', socks: '#ff0000' }, // Red/White
      away: { shirt: '#ffffff', shorts: '#ff0000', socks: '#ffffff' } // White/Red
    },
    'FC Aalsmeer': {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'RKVV Velsen': {
      home: { shirt: '#00ff00', shorts: '#000000', socks: '#00ff00' }, // Green/Black
      away: { shirt: '#000000', shorts: '#00ff00', socks: '#000000' } // Black/Green
    },
    'VIOS W': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'CSV BOL': {
      home: { shirt: '#ff6600', shorts: '#ffffff', socks: '#ff6600' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff6600', socks: '#ffffff' } // White/Orange
    },
    'Sporting Martinus': {
      home: { shirt: '#800080', shorts: '#ffffff', socks: '#800080' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#800080', socks: '#ffffff' } // White/Purple
    },
    'VV ZOB': {
      home: { shirt: '#00ffff', shorts: '#000000', socks: '#00ffff' }, // Cyan/Black
      away: { shirt: '#000000', shorts: '#00ffff', socks: '#000000' } // Black/Cyan
    },
    'SV Hillegom': {
      home: { shirt: '#ff8800', shorts: '#ffffff', socks: '#ff8800' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff8800', socks: '#ffffff' } // White/Orange
    },
    'HBOK': {
      home: { shirt: '#8800ff', shorts: '#ffffff', socks: '#8800ff' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#8800ff', socks: '#ffffff' } // White/Purple
    },
    'VV HSV': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'VV De Zouaven': {
      home: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' }, // Blue/Yellow
      away: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' } // Yellow/Blue
    },
    'ZSGOWMS': {
      home: { shirt: '#00ff00', shorts: '#ffffff', socks: '#00ff00' }, // Green/White
      away: { shirt: '#ffffff', shorts: '#00ff00', socks: '#ffffff' } // White/Green
    },
    'VV AGB': {
      home: { shirt: '#ffff00', shorts: '#0000ff', socks: '#ffff00' }, // Yellow/Blue
      away: { shirt: '#0000ff', shorts: '#ffff00', socks: '#0000ff' } // Blue/Yellow
    },
    'AGB': {
      home: { shirt: '#ff0000', shorts: '#000000', socks: '#ff0000' }, // Red/Black
      away: { shirt: '#000000', shorts: '#ff0000', socks: '#000000' } // Black/Red
    },
    'VV Assendelft': {
      home: { shirt: '#0000ff', shorts: '#ffffff', socks: '#0000ff' }, // Blue/White
      away: { shirt: '#ffffff', shorts: '#0000ff', socks: '#ffffff' } // White/Blue
    },
    'Fortuna Wormerveer': {
      home: { shirt: '#00ff00', shorts: '#000000', socks: '#00ff00' }, // Green/Black
      away: { shirt: '#000000', shorts: '#00ff00', socks: '#000000' } // Black/Green
    },
    'IVV': {
      home: { shirt: '#ffff00', shorts: '#000000', socks: '#ffff00' }, // Yellow/Black
      away: { shirt: '#000000', shorts: '#ffff00', socks: '#000000' } // Black/Yellow
    },
    'Kolping Boys': {
      home: { shirt: '#ff6600', shorts: '#ffffff', socks: '#ff6600' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff6600', socks: '#ffffff' } // White/Orange
    },
    'LSVV': {
      home: { shirt: '#800080', shorts: '#ffffff', socks: '#800080' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#800080', socks: '#ffffff' } // White/Purple
    },
    'SV De Meer': {
      home: { shirt: '#ff00ff', shorts: '#000000', socks: '#ff00ff' }, // Magenta/Black
      away: { shirt: '#000000', shorts: '#ff00ff', socks: '#000000' } // Black/Magenta
    },
    'SDZ': {
      home: { shirt: '#00ffff', shorts: '#000000', socks: '#00ffff' }, // Cyan/Black
      away: { shirt: '#000000', shorts: '#00ffff', socks: '#000000' } // Black/Cyan
    },
    'FC Uitgeest': {
      home: { shirt: '#ff8800', shorts: '#ffffff', socks: '#ff8800' }, // Orange/White
      away: { shirt: '#ffffff', shorts: '#ff8800', socks: '#ffffff' } // White/Orange
    },
    'Vitesse \'22 Zondag': {
      home: { shirt: '#8800ff', shorts: '#ffffff', socks: '#8800ff' }, // Purple/White
      away: { shirt: '#ffffff', shorts: '#8800ff', socks: '#ffffff' } // White/Purple
    }
  };

  // Generic kit colors for clubs not in the predefined list
  private static readonly GENERIC_KITS: TeamKits[] = [
    { home: { shirt: '#ff0000', shorts: '#ff0000', socks: '#ff0000' }, away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' } },
    { home: { shirt: '#0000ff', shorts: '#0000ff', socks: '#0000ff' }, away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' } },
    { home: { shirt: '#00ff00', shorts: '#00ff00', socks: '#00ff00' }, away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' } },
    { home: { shirt: '#ffff00', shorts: '#ffff00', socks: '#ffff00' }, away: { shirt: '#000000', shorts: '#000000', socks: '#000000' } },
    { home: { shirt: '#ff00ff', shorts: '#ff00ff', socks: '#ff00ff' }, away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' } },
    { home: { shirt: '#00ffff', shorts: '#00ffff', socks: '#00ffff' }, away: { shirt: '#000000', shorts: '#000000', socks: '#000000' } },
    { home: { shirt: '#ff8800', shorts: '#ff8800', socks: '#ff8800' }, away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' } },
    { home: { shirt: '#8800ff', shorts: '#8800ff', socks: '#8800ff' }, away: { shirt: '#ffffff', shorts: '#ffffff', socks: '#ffffff' } }
  ];

  // In-memory kit storage since Club model doesn't have kit fields
  private static readonly clubKitCache: Map<number, TeamKits> = new Map();

  /**
   * Get kit colors for a club, creating them if they don't exist
   */
  static async getClubKitColors(clubId: number): Promise<TeamKits> {
    // Check in-memory cache first
    const cached = this.clubKitCache.get(clubId);
    if (cached) return cached;

    // Get club name to generate appropriate kit colors
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { name: true }
    });

    if (!club) {
      throw new Error(`Club with ID ${clubId} not found`);
    }

    // Generate kit colors based on club name
    const kitColors = this.getKitColorsForClub(club.name);
    this.clubKitCache.set(clubId, kitColors);
    return kitColors;
  }

  /**
   * Update kit colors for a club (stored in memory)
   */
  static async updateClubKitColors(clubId: number, kitColors: TeamKits): Promise<void> {
    this.clubKitCache.set(clubId, kitColors);
  }

  /**
   * Get appropriate kit colors for a club based on name
   */
  private static getKitColorsForClub(clubName: string): TeamKits {
    // Check if we have predefined colors for this club
    const predefinedKit = this.DUTCH_CLUB_KITS[clubName];
    if (predefinedKit) {
      return predefinedKit;
    }

    // Use generic colors based on club name hash
    const hash = this.hashString(clubName);
    const genericKitIndex = hash % this.GENERIC_KITS.length;
    return this.GENERIC_KITS[genericKitIndex];
  }

  /**
   * Determine which kit each team should wear to avoid color clashes
   */
  static async getMatchKitColors(homeClubId: number, awayClubId: number): Promise<{
    home: KitColors;
    away: KitColors;
  }> {
    const [homeKits, awayKits] = await Promise.all([
      this.getClubKitColors(homeClubId),
      this.getClubKitColors(awayClubId)
    ]);

    // Check for color clash between home team's home kit and away team's home kit
    const hasClash = this.detectColorClash(homeKits.home, awayKits.home);

    if (hasClash) {
      // Away team should wear away kit
      return {
        home: homeKits.home,
        away: awayKits.away
      };
    } else {
      // Both teams can wear home kits
      return {
        home: homeKits.home,
        away: awayKits.home
      };
    }
  }

  /**
   * Detect if there's a color clash between two kits
   */
  private static detectColorClash(kit1: KitColors, kit2: KitColors): boolean {
    // Convert hex to RGB for better color comparison
    const rgb1 = this.hexToRgb(kit1.shirt);
    const rgb2 = this.hexToRgb(kit2.shirt);

    if (!rgb1 || !rgb2) return false;

    // Calculate color similarity using Euclidean distance
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );

    // More sophisticated clash detection
    // Consider both shirt color similarity and overall kit pattern

    // 1. Direct color similarity (shirt vs shirt)
    const shirtClash = distance < 80;

    // 2. Check if both teams have similar dominant colors
    const kit1Dominant = this.getDominantColor(kit1);
    const kit2Dominant = this.getDominantColor(kit2);
    const dominantClash = this.hexToRgb(kit1Dominant) && this.hexToRgb(kit2Dominant) &&
      Math.sqrt(
        Math.pow(this.hexToRgb(kit1Dominant)!.r - this.hexToRgb(kit2Dominant)!.r, 2) +
        Math.pow(this.hexToRgb(kit1Dominant)!.g - this.hexToRgb(kit2Dominant)!.g, 2) +
        Math.pow(this.hexToRgb(kit1Dominant)!.b - this.hexToRgb(kit2Dominant)!.b, 2)
      ) < 100;

    // 3. Check for both teams wearing white (common clash)
    const bothWhite = this.isWhite(kit1.shirt) && this.isWhite(kit2.shirt);

    // 4. Check for both teams wearing dark colors
    const bothDark = this.isDark(kit1.shirt) && this.isDark(kit2.shirt);

    return shirtClash || dominantClash || bothWhite || bothDark;
  }

  /**
   * Get the dominant color from a kit (most prominent color)
   */
  private static getDominantColor(kit: KitColors): string {
    // If shirt is white, check shorts
    if (this.isWhite(kit.shirt)) {
      return kit.shorts;
    }
    // If shirt is dark, check if shorts provide contrast
    if (this.isDark(kit.shirt)) {
      return this.isLight(kit.shorts) ? kit.shorts : kit.shirt;
    }
    return kit.shirt;
  }

  /**
   * Check if a color is white or very light
   */
  private static isWhite(hex: string): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return false;
    return rgb.r > 240 && rgb.g > 240 && rgb.b > 240;
  }

  /**
   * Check if a color is light
   */
  private static isLight(hex: string): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return false;
    return (rgb.r + rgb.g + rgb.b) / 3 > 180;
  }

  /**
   * Check if a color is dark
   */
  private static isDark(hex: string): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return false;
    return (rgb.r + rgb.g + rgb.b) / 3 < 100;
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Simple hash function for string
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Initialize kit colors for all clubs in the database
   */
  static async initializeAllClubKitColors(): Promise<void> {
    const clubs = await prisma.club.findMany({
      select: { id: true, name: true }
    });

    for (const club of clubs) {
      const kitColors = this.getKitColorsForClub(club.name);
      await this.updateClubKitColors(club.id, kitColors);
    }
  }
} 
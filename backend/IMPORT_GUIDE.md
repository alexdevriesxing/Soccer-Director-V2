# Football Data Import Guide

This guide explains how to import real football club and player history into your football management game.

## 🚀 Quick Start

### 1. Import Sample Data (Always Works)
```bash
npx ts-node prisma/seed/importRealData.ts
```

This will import:
- **5 Real Dutch Clubs**: Ajax, PSV Eindhoven, Feyenoord, AZ Alkmaar, FC Twente
- **5 Real Players**: Steven Bergwijn, Cody Gakpo, Orkun Kökçü, Vangelis Pavlidis, Michel Vlap
- **13 Historical Matches**: Real Eredivisie fixtures from 2024

### 2. Get Live Data (Optional)

#### Football-Data.org API
1. Register at [Football-Data.org](https://www.football-data.org/client/register)
2. Get your free API key
3. Edit `prisma/seed/importRealData.ts` and replace `'YOUR_API_KEY_HERE'` with your key
4. Run the import script again

**Available Leagues:**
- Eredivisie (Netherlands)
- Premier League (England)
- Bundesliga (Germany)
- La Liga (Spain)
- Serie A (Italy)

#### CSV Data Sources
Download CSV files from these sources and place them in `backend/data/`:

**Football.csv (Recommended)**
- [Netherlands](https://github.com/footballcsv/netherlands)
- [England](https://github.com/footballcsv/england)
- [Germany](https://github.com/footballcsv/deutschland)
- [Spain](https://github.com/footballcsv/espana)

**Example CSV Format:**
```csv
Date,Home,Away,HomeGoals,AwayGoals,Competition
2024-01-15,Ajax,PSV Eindhoven,2,1,Eredivisie
2024-01-20,Feyenoord,AZ Alkmaar,3,0,Eredivisie
```

## 📊 Data Sources

### 1. **Football-Data.org API** (Live Data)
- **Coverage**: Major European leagues
- **Data**: Clubs, players, matches, standings
- **Cost**: Free tier available
- **Rate Limits**: 10 requests/minute (free)

### 2. **Football.csv** (Historical Data)
- **Coverage**: Worldwide, multiple seasons
- **Data**: Match results, league tables, club info
- **Cost**: Free (open source)
- **Format**: CSV files

### 3. **Transfermarkt** (Player Data)
- **Coverage**: Global player database
- **Data**: Player stats, transfer history, market values
- **Cost**: Free (scraping required)
- **Note**: Requires custom scraper

### 4. **Kaggle Datasets** (Analytics)
- **Coverage**: Various football datasets
- **Data**: Player stats, match analytics, FIFA ratings
- **Cost**: Free
- **Examples**: FIFA player ratings, match statistics

## 🔧 Customization

### Adding New Data Sources

1. **Create a new import function** in `importRealData.ts`:
```typescript
async function importFromNewSource() {
  // Your import logic here
  console.log('Importing from new source...');
}
```

2. **Add to main import function**:
```typescript
async function importRealData() {
  await importFromSampleData();
  await importFromFootballDataAPI();
  await importFromNewSource(); // Add here
  await importHistoricalMatches();
  await importFromCSV();
}
```

### Extending Player Data

Add more player fields to the sample data:
```typescript
SAMPLE_PLAYERS: [
  {
    name: 'New Player',
    position: 'FWD',
    age: 25,
    nationality: 'Netherlands',
    skill: 75,
    potential: 80,
    wage: 40000,
    clubName: 'Ajax',
    // Add custom fields
    personality: 'PROFESSIONAL',
    ambition: 4,
    reputation: 70
  }
]
```

### Adding More Clubs

Extend the sample clubs array:
```typescript
SAMPLE_CLUBS: [
  // Existing clubs...
  {
    name: 'New Club',
    homeCity: 'City Name',
    stadium: 'Stadium Name',
    regionTag: 'NLD',
    leagueId: 1,
    founded: 1900,
    colors: { home: 'Red-White', away: 'White-Red' }
  }
]
```

## 📈 Advanced Features

### 1. **Historical Seasons**
Import multiple seasons by modifying the CSV import:
```typescript
const seasons = ['2023-24', '2022-23', '2021-22'];
for (const season of seasons) {
  await importFromCSV(`data/eredivisie-${season}.csv`);
}
```

### 2. **Player Development Tracking**
Track player skill progression over time:
```typescript
// Add to player creation
const player = await prisma.player.create({
  data: {
    // ... existing fields
    careerStats: {
      create: {
        season: '2023/24',
        goals: 15,
        assists: 8,
        appearances: 28
      }
    }
  }
});
```

### 3. **Club Financial History**
Import historical financial data:
```typescript
await prisma.clubFinances.create({
  data: {
    clubId: club.id,
    season: '2023/24',
    balance: 50000000,
    transferBudget: 20000000,
    wageBudget: 15000000
  }
});
```

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check your API key is correct
   - Verify you haven't exceeded rate limits
   - Try the free tier endpoints only

2. **CSV Import Fails**
   - Check CSV format matches expected structure
   - Ensure dates are in YYYY-MM-DD format
   - Verify club names match existing clubs

3. **Database Errors**
   - Run `npx prisma migrate dev` to sync schema
   - Check field names match Prisma schema
   - Verify enum values are correct

### Debug Mode

Enable detailed logging:
```typescript
// Add to importRealData.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Debug: Processing club:', club.name);
  console.log('Debug: Player data:', playerData);
}
```

## 📚 API Documentation

### Football-Data.org Endpoints

```typescript
// Get leagues
GET /v4/competitions

// Get teams in league
GET /v4/competitions/{id}/teams

// Get team details
GET /v4/teams/{id}

// Get matches
GET /v4/competitions/{id}/matches
```

### Response Format
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Ajax",
      "area": { "name": "Netherlands", "code": "NLD" },
      "venue": "Johan Cruyff Arena"
    }
  ],
  "squad": [
    {
      "id": 1,
      "name": "Steven Bergwijn",
      "position": "Forward",
      "nationality": "Netherlands",
      "dateOfBirth": "1997-10-08"
    }
  ]
}
```

## 🎯 Next Steps

1. **Get API Key**: Register for Football-Data.org API
2. **Download CSV Files**: Get historical data from football.csv
3. **Extend Data**: Add more clubs, players, and historical matches
4. **Customize**: Modify import logic for your specific needs
5. **Automate**: Set up scheduled imports for live data

## 📞 Support

- **Schema Issues**: Check `backend/prisma/schema.prisma`
- **Import Errors**: Check console output for specific errors
- **Data Sources**: Visit the linked repositories for more data
- **API Limits**: Monitor your API usage on Football-Data.org

---

**Happy Importing! 🏆** 
# Dutch Football Manager — Game Design Document (GDD)

## 1. Game Overview
A deep, realistic football management simulation set in the Dutch football pyramid, from Eredivisie to the Vijfde Klasse, including O21 leagues. The game features full club, squad, and staff management, realistic match simulation, financial and stadium management, and international competitions. Built with Phaser.js and Three.js for graphical scenes, and designed for eventual desktop (Steam) release.

## 2. Core Gameplay Loop
1. **Title Screen**: Displays for 5 seconds, then transitions to the main menu.
2. **Main Menu**: Options to create a new profile, load an existing profile, or exit.
3. **Profile Creation**: Choose any club in the Dutch pyramid (including O21 teams), or create a new club (custom name, city, kit, and squad).
4. **Club Management**: Access a menu with:
   - Play Match
   - Next Opponent
   - Squad
   - Results/Fixtures
   - League Tables
   - Training
   - Transfer Market
   - Finances/Stadium
   - Staff
   - European Cups
   - International Matches
   - O21 Team (if available)
   - Club Status/History
   - Arrange Friendlies
   - Topscorers/Assists

## 3. Match Simulation
- **Pre-Match**: Select squad (auto/manual), tactics, and focus.
- **Match**: 2D scene (Phaser.js) for goals, saves, and key events (25+ variations). Timer runs (2s per minute) for each half, with halftime and injury time.
- **Events**: Text popups for goals, cards, injuries, etc.
- **Cup/Playoff**: Extra time and penalties if needed.
- **Post-Match**: Show results, league table, and return to club menu.

## 4. Player Model
- **Attributes (0–100 scale):**
  - **All Players (15):** Stamina, Strength, Agility, Speed, Dribbling, Penalties, Shooting, Passing, Tackling, Heading, Composure, Positioning, Set Pieces, Leadership, Concentration
  - **Goalkeepers (11):** Stamina, Strength, Agility, Long Kicks, Concentration, Composure, Reflexes, Diving, Throwing, Penalties, Leadership
- **Other Properties:** Name, Age (16–42), Nationality, Position, Morale, Fitness, Injured, International Caps, Club History, Contract, Wage, Player Card (history, stats, etc.)
- **O21 Teams:** Players aged 16–21, move to first team or free agency at 22.
- **Squad Size:** 25 players per club and O21 team.

## 5. League & Competition Structure
- **Dutch Pyramid:** Eredivisie, Eerste Divisie, Tweede Divisie, Derde Divisie (A/B), Vierde Divisie (A–D), O21 Leagues, all regional/klasse divisions.
- **Promotion/Relegation:** Follows KNVB rules, including playoffs.
- **Cups:** KNVB Beker, European Cups (UEFA, FIFA), with real qualification rules and club pools.
- **International Matches:** National teams, O21 national team, call-ups, and effects on morale/fitness.

## 6. Club & Staff Management
- **Squad:** Manage players, injuries, loans, international duty.
- **Transfers:** Buy/sell/loan, scout, search, and negotiate.
- **Training:** Set focus, assign extra training, manage fatigue and progression.
- **Finances:** Budgets, loans, sponsorships, stadium upgrades, bankruptcy, bailouts.
- **Staff:** Hire/fire, assign roles (tactics, training, physio, marketing, PR, finance).
- **Friendlies:** Arrange matches with any club, including reserve pool teams.
- **Club Status/History:** Track achievements, league history, top players, ownership, investments, IPOs.

## 7. Player Lifecycle
- **Ages:** 16–42 (rare above 35), retire 32–42.
- **New Players:** Generated at 16, with realistic Dutch/foreign name mix.
- **Morale/Fitness:** Affected by results, training, matches, injuries, call-ups.
- **Development:** Young players improve, older players decline (esp. speed, agility, stamina after 32).

## 8. UI/UX
- **Menu-Driven:** All club features accessible via menu.
- **2D Match Scenes:** Key events visualized with Phaser.js assets.
- **Text-Based Events:** Goals, cards, injuries, etc., as popups.
- **Tables/Lists:** For squads, fixtures, league tables, stats.

## 9. Data & Performance
- **Efficient Data Loading:** Chunked/paged loading for large datasets.
- **Async Operations:** For all heavy data and simulation tasks.
- **Error Handling:** All features must have robust error handling and catch blocks.

## 10. Testing
- **Unit/Integration Tests:** For all features, especially simulation, transfers, and data management.
- **Test Coverage:** Each new feature must include tests.

## 11. Steam/Desktop Release
- **Electron or similar for packaging.**
- **Modding support and localization planned.**

## 12. Cursor AI Guidelines
- **Follow this GDD for all features and refactors.**
- **Always present a clear plan before coding.**
- **Write tests for every new feature.**
- **Ensure robust error handling (try/catch, user-friendly errors).**
- **Use modular, maintainable code structure.**
- **Prioritize performance and scalability.**
- **Document all major features and APIs.** 
# Dutch Football Manager

A comprehensive football management simulation game set in the Dutch football pyramid, from Eredivisie to Vijfde Klasse, including O21 leagues. Manage your club, develop players, handle transfers, and compete in realistic match simulations. Built with React, TypeScript, Node.js, Prisma, Phaser.js, and Three.js.

## 📄 Documentation
- [GDD.md](./GDD.md) — Full Game Design Document
- [ROADMAP.md](./ROADMAP.md) — Step-by-step plan and task list
- [rules.md](./rules.md) — Coding and architectural rules

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd football-management-game
   ```
2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```
3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```
4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```
5. **Start the development servers**
   - Backend: `cd ../backend && npm run dev`
   - Frontend: `cd ../frontend && npm start`

## 🎮 Features
- Full Dutch league pyramid, O21 leagues, and real promotion/relegation rules
- Realistic player model with 15+ attributes, morale, fitness, and history
- 2D match scenes for key events (Phaser.js)
- Complete club, staff, transfer, and financial management
- European and international competitions
- Robust error handling and test coverage

See [GDD.md](./GDD.md) for full details. 

# Jong Team Management System

## Features
- Full CRUD for Jong teams and staff (admin only)
- Player movement between Jong and first team (individual, bulk, auto-promotion/demotion)
- Staff management (add/edit/delete coaches, physios)
- Analytics dashboard (player development, staff impact, squad performance)
- Finances UI (budgets, wages, parent club impact)
- Notifications (promotion eligibility, expiring contracts, injuries)
- In-app help modal and tooltips for all advanced features
- Robust error handling and admin gating (scaffolded for real auth)
- Deep simulation integration: Jong team staff/finances affect player development and injury risk

## Admin UI Usage
- Access Jong Team Management from the admin panel
- Use CRUD controls to create, edit, or delete Jong teams and staff
- Move players between squads individually or in bulk
- Use auto-promotion/demotion for eligible players
- View analytics, finances, and notifications via dedicated buttons (with tooltips)
- Use the help button (❓) for in-app guidance

## Simulation Integration
- Jong team coach skill boosts player skill gain
- Physio skill reduces injury risk
- Wage budget acts as a multiplier for development
- All logic is applied automatically during weekly simulation for all clubs, including Jong teams

## API Endpoints (Summary)
- `POST /api/jong-team/:parentClubId` — Create Jong team
- `PATCH /api/jong-team/:jongTeamId` — Edit Jong team
- `DELETE /api/jong-team/:jongTeamId` — Delete Jong team
- `POST /api/jong-team/:jongTeamId/add-player/:playerId` — Move player to Jong team
- `POST /api/jong-team/:parentClubId/promote-player/:playerId` — Promote player to first team
- `POST /api/jong-team/:jongTeamId/add-players` — Bulk move to Jong team
- `POST /api/jong-team/:parentClubId/promote-players` — Bulk promote to first team
- `POST /api/jong-team/:jongTeamId/auto-promote` — Auto-promote eligible players
- `POST /api/jong-team/:parentClubId/auto-demote` — Auto-demote eligible players
- `POST /api/jong-team/:jongTeamId/staff` — Add staff
- `PATCH /api/jong-team/:jongTeamId/staff/:staffId` — Edit staff
- `DELETE /api/jong-team/:jongTeamId/staff/:staffId` — Delete staff
- `GET /api/jong-team/:jongTeamId/analytics` — Analytics dashboard
- `GET /api/jong-team/:jongTeamId/finances` — Finances
- `PATCH /api/jong-team/:jongTeamId/finances` — Edit budgets
- `GET /api/jong-team/:jongTeamId/notifications` — Notifications

## Testing Instructions
- **Backend:**
  - Run `npm test` in the backend directory to execute all endpoint and logic tests
- **Frontend:**
  - Run `npm test` in the frontend directory to execute all UI and logic tests

## Extending or Maintaining
- All features are modular and admin-gated
- To add new analytics, finances, or notifications, extend the relevant backend endpoints and update the frontend UI
- For real authentication, replace the admin gating scaffolding with your auth provider

---
For further details, see the in-app help modal or review the code in `backend/src/routes/jongTeam.ts` and `frontend/src/components/JongTeamManagement.tsx`. 
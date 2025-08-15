# Custom React Hooks

This directory contains custom React hooks used throughout the frontend for modular, reusable business and data logic.

## Hooks Overview

### `useSquadManagement`
- **Purpose:** Manages squad data fetching, pagination, and player status filtering for the Squad Management UI.
- **Parameters:**
  - `profile`: The manager profile object (should contain clubId or club.id)
  - `navigate`: React Router navigate function for redirection
- **Returns:**
  - `players`, `loading`, `error`, `page`, `pageSize`, `totalPlayers`, `totalPages`, `setPage`, `setPageSize`, `getPlayersByStatus`

### `useO21TeamManagement`
- **Purpose:** Handles O21 team and parent club player data, pagination, and error handling for the O21 Team Management UI.
- **Parameters:**
  - `profile`: The manager profile object (should contain club name)
  - `navigate`: React Router navigate function for redirection
- **Returns:**
  - `o21Team`, `parentClubPlayers`, `loading`, `activeTab`, `setActiveTab`, `selectedPlayer`, `setSelectedPlayer`, `showContractModal`, `setShowContractModal`, `contractDetails`, `setContractDetails`, `clubId`, `o21Page`, `setO21Page`, `o21PageSize`, `setO21PageSize`, `o21TotalPlayers`, `o21TotalPages`, `parentPage`, `setParentPage`, `parentPageSize`, `setParentPageSize`, `parentTotalPlayers`, `parentTotalPages`, `loadingO21`, `loadingParent`, `errorO21`, `errorParent`, `loadO21Team`, `loadParentClubPlayers`

### `useJongTeamManagement`
- **Purpose:** Encapsulates all business/data logic for Jong team and first squad management, including graduation logic and pagination.
- **Parameters:**
  - `open`: Whether the management modal is open
  - `parentClub`: The parent club object (or null)
- **Returns:**
  - `jongSquad`, `firstSquad`, `loading`, `jongTeam`, `leagueTable`, `fixtures`, `graduations`, `showGraduation`, `currentGrad`, `jongPage`, `setJongPage`, `jongPageSize`, `setJongPageSize`, `jongTotalPlayers`, `jongTotalPages`, `firstPage`, `setFirstPage`, `firstPageSize`, `setFirstPageSize`, `firstTotalPlayers`, `firstTotalPages`, `loadingJong`, `loadingFirst`, `errorJong`, `errorFirst`, `handleGraduationDecision`, `setShowGraduation`, `setCurrentGrad`

---

For detailed API and usage, see the JSDoc comments in each hook file. 
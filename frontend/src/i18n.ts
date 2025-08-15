import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { 
    translation: { 
      // Common UI
      'welcome': 'Welcome',
      'settings': 'Settings',
      'language': 'Language',
      'save': 'Save',
      'cancel': 'Cancel',
      'back': 'Back',
      'next': 'Next',
      'previous': 'Previous',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'warning': 'Warning',
      'info': 'Information',
      'confirm': 'Confirm',
      'delete': 'Delete',
      'edit': 'Edit',
      'create': 'Create',
      'update': 'Update',
      'search': 'Search',
      'filter': 'Filter',
      'sort': 'Sort',
      'apply': 'Apply',
      'reset': 'Reset',
      'close': 'Close',
      'yes': 'Yes',
      'no': 'No',
      
      // Navigation
      'home': 'Home',
      'profile': 'Profile',
      'dashboard': 'Dashboard',
      'squad': 'Squad',
      'transfers': 'Transfers',
      'finances': 'Finances',
      'facilities': 'Facilities',
      'youthAcademy': 'Youth Academy',
      'staff': 'Staff',
      'tactics': 'Tactics',
      'training': 'Training',
      'scouting': 'Scouting',
      
      // Game specific
      'startNewGame': 'Start New Game',
      'loadGame': 'Load Game',
      'continue': 'Continue',
      'newGame': 'New Game',
      'saveGame': 'Save Game',
      'exitGame': 'Exit Game',
      
      // Player related
      'players': 'Players',
      'player': 'Player',
      'name': 'Name',
      'age': 'Age',
      'nationality': 'Nationality',
      'position': 'Position',
      'overall': 'Overall',
      'potential': 'Potential',
      'value': 'Value',
      'wage': 'Wage',
      'contract': 'Contract',
      
      // Match related
      'matches': 'Matches',
      'match': 'Match',
      'homeTeam': 'Home Team',
      'awayTeam': 'Away Team',
      'score': 'Score',
      'possession': 'Possession',
      'shots': 'Shots',
      'shotsOnTarget': 'Shots on Target',
      'corners': 'Corners',
      'fouls': 'Fouls',
      'yellowCards': 'Yellow Cards',
      'redCards': 'Red Cards',
      'halfTime': 'Half Time',
      'fullTime': 'Full Time',
      
      // Club related
      'club': 'Club',
      'clubs': 'Clubs',
      'reputation': 'Reputation',
      'transferBudget': 'Transfer Budget',
      'wageBudget': 'Wage Budget',
      'balance': 'Balance',
      
      // Staff related
      'staff.title': 'Staff',
      'staff.manager': 'Manager',
      'staff.coaches': 'Coaches',
      'staff.scouts': 'Scouts',
      'staff.physios': 'Physios',
      
      // Live Matches
      'Live Matches': 'Live Matches',
      'liveMatches.title': 'Live Matches',
      'liveMatches.subtitle': 'Follow matches in real-time',
      'liveMatches.noMatches': 'No Live Matches',
      'liveMatches.noMatchesDescription': 'There are currently no matches being played. Check back later!',
      'common.loading': 'Loading',
      'common.retry': 'Retry'
    } 
  },
  nl: { 
    translation: { 
      // Common UI
      'welcome': 'Welkom',
      'settings': 'Instellingen',
      'language': 'Taal',
      'save': 'Opslaan',
      'cancel': 'Annuleren',
      'back': 'Terug',
      'next': 'Volgende',
      'previous': 'Vorige',
      'loading': 'Laden...',
      'error': 'Fout',
      'success': 'Gelukt',
      'warning': 'Waarschuwing',
      'info': 'Informatie',
      'confirm': 'Bevestigen',
      'delete': 'Verwijderen',
      'edit': 'Bewerken',
      'create': 'Aanmaken',
      'update': 'Bijwerken',
      'search': 'Zoeken',
      'filter': 'Filteren',
      'sort': 'Sorteren',
      'apply': 'Toepassen',
      'reset': 'Resetten',
      'close': 'Sluiten',
      'yes': 'Ja',
      'no': 'Nee',
      
      // Navigation
      'home': 'Start',
      'profile': 'Profiel',
      'dashboard': 'Dashboard',
      'squad': 'Selectie',
      'transfers': 'Transfers',
      'finances': 'Financiën',
      'facilities': 'Faciliteiten',
      'youthAcademy': 'Jeugdopleiding',
      'staff': 'Staf',
      'tactics': 'Tactiek',
      'training': 'Training',
      'scouting': 'Scouting',
      
      // Game specific
      'startNewGame': 'Nieuw Spel Starten',
      'loadGame': 'Spel Laden',
      'continue': 'Doorgaan',
      'newGame': 'Nieuw Spel',
      'saveGame': 'Spel Opslaan',
      'exitGame': 'Spel Afsluiten',
      
      // Player related
      'players': 'Spelers',
      'player': 'Speler',
      'name': 'Naam',
      'age': 'Leeftijd',
      'nationality': 'Nationaliteit',
      'position': 'Positie',
      'overall': 'Totaal',
      'potential': 'Potentieel',
      'value': 'Waarde',
      'wage': 'Loon',
      'contract': 'Contract',
      
      // Match related
      'matches': 'Wedstrijden',
      'match': 'Wedstrijd',
      'homeTeam': 'Thuisteam',
      'awayTeam': 'Uitteam',
      'score': 'Stand',
      'possession': 'Balbezit',
      'shots': 'Schoten',
      'shotsOnTarget': 'Schoten op doel',
      'corners': 'Hoekschoppen',
      'fouls': 'Overtredingen',
      'yellowCards': 'Gele kaarten',
      'redCards': 'Rode kaarten',
      'halfTime': 'Rust',
      'fullTime': 'Eindstand',
      
      // Club related
      'club': 'Club',
      'clubs': 'Clubs',
      'reputation': 'Reputatie',
      'transferBudget': 'Transferbudget',
      'wageBudget': 'Loonbudget',
      'balance': 'Saldo',
      
      // Staff related
      'staff.manager': 'Trainer',
      'staff.coaches': 'Trainers',
      'staff.scouts': 'Scouts',
      'staff.physios': 'Fysiotherapeuten',
      
      // Live Matches
      'Live Matches': 'Live Wedstrijden',
      'liveMatches.title': 'Live Wedstrijden',
      'liveMatches.subtitle': 'Volg wedstrijden in real-time',
      'liveMatches.noMatches': 'Geen Live Wedstrijden',
      'liveMatches.noMatchesDescription': 'Er worden momenteel geen wedstrijden gespeeld. Kom later terug!',
      'common.loading': 'Laden',
      'common.retry': 'Opnieuw proberen'
    } 
  },
  de: { 
    translation: { 
      // Common UI
      'welcome': 'Willkommen',
      'settings': 'Einstellungen',
      'language': 'Sprache',
      'save': 'Speichern',
      'cancel': 'Abbrechen',
      'back': 'Zurück',
      'next': 'Weiter',
      'previous': 'Zurück',
      'loading': 'Laden...',
      'error': 'Fehler',
      'success': 'Erfolg',
      'warning': 'Warnung',
      'info': 'Information',
      'confirm': 'Bestätigen',
      'delete': 'Löschen',
      'edit': 'Bearbeiten',
      'create': 'Erstellen',
      'update': 'Aktualisieren',
      'search': 'Suchen',
      'filter': 'Filter',
      'sort': 'Sortieren',
      'apply': 'Anwenden',
      'reset': 'Zurücksetzen',
      'close': 'Schließen',
      'yes': 'Ja',
      'no': 'Nein',
      
      // Navigation
      'home': 'Startseite',
      'profile': 'Profil',
      'dashboard': 'Übersicht',
      'squad': 'Kader',
      'transfers': 'Transfers',
      'finances': 'Finanzen',
      'facilities': 'Einrichtungen',
      'youthAcademy': 'Jugendakademie',
      'staff.title': 'Personal',
      'tactics': 'Taktik',
      'training': 'Training',
      'scouting': 'Scouting',
      
      // Game specific
      'startNewGame': 'Neues Spiel starten',
      'loadGame': 'Spiel laden',
      'continue': 'Weiter',
      'newGame': 'Neues Spiel',
      'saveGame': 'Spiel speichern',
      'exitGame': 'Spiel beenden',
      
      // Player related
      'players': 'Spieler',
      'player': 'Spieler',
      'name': 'Name',
      'age': 'Alter',
      'nationality': 'Nationalität',
      'position': 'Position',
      'overall': 'Gesamt',
      'potential': 'Potenzial',
      'value': 'Wert',
      'wage': 'Gehalt',
      'contract': 'Vertrag',
      
      // Match related
      'matches': 'Spiele',
      'match': 'Spiel',
      'homeTeam': 'Heimteam',
      'awayTeam': 'Gastteam',
      'score': 'Ergebnis',
      'possession': 'Ballbesitz',
      'shots': 'Schüsse',
      'shotsOnTarget': 'Schüsse aufs Tor',
      'corners': 'Ecken',
      'fouls': 'Fouls',
      'yellowCards': 'Gelbe Karten',
      'redCards': 'Rote Karten',
      'halfTime': 'Halbzeit',
      'fullTime': 'Spielende',
      
      // Club related
      'club': 'Verein',
      'clubs': 'Vereine',
      'reputation': 'Ruf',
      'transferBudget': 'Transferbudget',
      'wageBudget': 'Gehaltsbudget',
      'balance': 'Kontostand',
      
      // Staff related
      'staff.manager': 'Manager',
      'staff.coaches': 'Trainer',
      'staff.scouts': 'Scouts',
      'staff.physios': 'Physiotherapeuten',
      
      // Live Matches
      'Live Matches': 'Live-Spiele',
      'liveMatches.title': 'Live-Spiele',
      'liveMatches.subtitle': 'Verfolgen Sie Spiele in Echtzeit',
      'liveMatches.noMatches': 'Keine Live-Spiele',
      'liveMatches.noMatchesDescription': 'Es werden derzeit keine Spiele ausgetragen. Schauen Sie später noch einmal vorbei!',
      'common.loading': 'Wird geladen',
      'common.retry': 'Erneut versuchen'
    } 
  },
  fr: { 
    translation: { 
      // Common UI
      'welcome': 'Bienvenue',
      'settings': 'Paramètres',
      'language': 'Langue',
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'back': 'Retour',
      'next': 'Suivant',
      'previous': 'Précédent',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'success': 'Succès',
      'warning': 'Avertissement',
      'info': 'Information',
      'confirm': 'Confirmer',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'create': 'Créer',
      'update': 'Mettre à jour',
      'search': 'Rechercher',
      'filter': 'Filtrer',
      'sort': 'Trier',
      'apply': 'Appliquer',
      'reset': 'Réinitialiser',
      'close': 'Fermer',
      'yes': 'Oui',
      'no': 'Non',
      
      // Navigation
      'home': 'Accueil',
      'profile': 'Profil',
      'dashboard': 'Tableau de bord',
      'squad': 'Effectif',
      'transfers': 'Transferts',
      'finances': 'Finances',
      'facilities': 'Installations',
      'youthAcademy': 'Centre de formation',
      'staff': 'Personnel',
      'tactics': 'Tactique',
      'training': 'Entraînement',
      'scouting': 'Détection',
      
      // Game specific
      'startNewGame': 'Nouvelle partie',
      'loadGame': 'Charger une partie',
      'continue': 'Continuer',
      'newGame': 'Nouveau jeu',
      'saveGame': 'Sauvegarder',
      'exitGame': 'Quitter le jeu',
      
      // Player related
      'players': 'Joueurs',
      'player': 'Joueur',
      'name': 'Nom',
      'age': 'Âge',
      'nationality': 'Nationalité',
      'position': 'Poste',
      'overall': 'Général',
      'potential': 'Potentiel',
      'value': 'Valeur',
      'wage': 'Salaire',
      'contract': 'Contrat',
      
      // Match related
      'matches': 'Matchs',
      'match': 'Match',
      'homeTeam': 'Domicile',
      'awayTeam': 'Extérieur',
      'score': 'Score',
      'possession': 'Possession',
      'shots': 'Tirs',
      'shotsOnTarget': 'Tirs cadrés',
      'corners': 'Corners',
      'fouls': 'Fautes',
      'yellowCards': 'Cartons jaunes',
      'redCards': 'Cartons rouges',
      'halfTime': 'Mi-temps',
      'fullTime': 'Fin du match',
      
      // Club related
      'club': 'Club',
      'clubs': 'Clubs',
      'reputation': 'Réputation',
      'transferBudget': 'Budget transferts',
      'wageBudget': 'Masse salariale',
      'balance': 'Solde',
      
      // Staff related
      'staff.title': 'Personnel',
      'staff.manager': 'Entraîneur',
      'staff.coaches': 'Entraîneurs',
      'staff.scouts': 'Recruteurs',
      'staff.physios': 'Kinésithérapeutes',
      
      // Live Matches
      'Live Matches': 'Matchs en Direct',
      'liveMatches.title': 'Matchs en Direct',
      'liveMatches.subtitle': 'Suivez les matchs en temps réel',
      'liveMatches.noMatches': 'Aucun Match en Direct',
      'liveMatches.noMatchesDescription': 'Aucun match en cours actuellement. Revenez plus tard !',
      'common.loading': 'Chargement',
      'common.retry': 'Réessayer'
    } 
  },
  ko: { 
    translation: { 
      // Common UI
      'welcome': '환영합니다',
      'settings': '설정',
      'language': '언어',
      'save': '저장',
      'cancel': '취소',
      'back': '뒤로',
      'next': '다음',
      'previous': '이전',
      'loading': '로딩 중...',
      'error': '오류',
      'success': '성공',
      'warning': '경고',
      'info': '정보',
      'confirm': '확인',
      'delete': '삭제',
      'edit': '편집',
      'create': '생성',
      'update': '업데이트',
      'search': '검색',
      'filter': '필터',
      'sort': '정렬',
      'apply': '적용',
      'reset': '초기화',
      'close': '닫기',
      'yes': '예',
      'no': '아니오',
      
      // Navigation
      'home': '홈',
      'profile': '프로필',
      'dashboard': '대시보드',
      'squad': '스쿼드',
      'transfers': '이적',
      'finances': '재정',
      'facilities': '시설',
      'youthAcademy': '유스 아카데미',
      'staff': '스태프',
      'tactics': '전술',
      'training': '훈련',
      'scouting': '스카우팅',
      
      // Game specific
      'startNewGame': '새 게임 시작',
      'loadGame': '게임 불러오기',
      'continue': '계속하기',
      'newGame': '새 게임',
      'saveGame': '게임 저장',
      'exitGame': '게임 종료',
      
      // Player related
      'players': '선수',
      'player': '선수',
      'name': '이름',
      'age': '나이',
      'nationality': '국적',
      'position': '포지션',
      'overall': '종합',
      'potential': '잠재력',
      'value': '가치',
      'wage': '주급',
      'contract': '계약',
      
      // Match related
      'matches': '경기',
      'match': '경기',
      'homeTeam': '홈팀',
      'awayTeam': '원정팀',
      'score': '스코어',
      'possession': '점유율',
      'shots': '슈팅',
      'shotsOnTarget': '유효 슈팅',
      'corners': '코너킥',
      'fouls': '파울',
      'yellowCards': '경고',
      'redCards': '퇴장',
      'halfTime': '전반 종료',
      'fullTime': '경기 종료',
      
      // Club related
      'club': '클럽',
      'clubs': '클럽',
      'reputation': '평판',
      'transferBudget': '이적 자금',
      'wageBudget': '주급 예산',
      'balance': '잔고',
      
      // Staff related
      'staff.title': '스태프',
      'staff.manager': '감독',
      'staff.coaches': '코치',
      'staff.scouts': '스카우트',
      'staff.physios': '물리치료사',
      
      // Live Matches
      'Live Matches': '생중계 경기',
      'liveMatches.title': '생중계 경기',
      'liveMatches.subtitle': '실시간으로 경기를 시청하세요',
      'liveMatches.noMatches': '진행 중인 경기가 없습니다',
      'liveMatches.noMatchesDescription': '현재 진행 중인 경기가 없습니다. 나중에 다시 확인해주세요!',
      'common.loading': '로딩 중',
      'common.retry': '다시 시도'
    } 
  }
};

const lang = localStorage.getItem('lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n; 
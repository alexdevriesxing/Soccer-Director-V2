import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBuilding, 
  faListUl, 
  faUser, 
  faTrophy, 
  faHistory, 
  faExchangeAlt, 
  faMoneyBill, 
  faClipboardList, 
  faSignOutAlt, 
  faWarehouse, 
  faUniversity, 
  faBalanceScale, 
  faTv 
} from '@fortawesome/free-solid-svg-icons';

export default function GameMenu() {
  const { t } = useTranslation();

  const menuItems = [
    { to: '/dashboard', label: t('Dashboard'), icon: faHome },
    { to: '/club', label: t('Club'), icon: faBuilding },
    { to: '/clubs', label: t('Club Management'), icon: faListUl },
    { to: '/players', label: t('Player Management'), icon: faUser },
    { to: '/squad', label: t('Squad'), icon: faUser },
    { to: '/o21-management', label: t('O21 Team'), icon: faUser },
    { to: '/youth-academy', label: t('Youth Academy'), icon: faUser },
    { to: '/transfers', label: t('Transfers'), icon: faExchangeAlt },
    { to: '/transfer-market', label: t('Transfer Market'), icon: faExchangeAlt },
    { to: '/matches/live', label: t('Live Matches'), icon: faTv },
    { to: '/finances', label: t('Finances'), icon: faMoneyBill },
    { to: '/financial-center', label: t('Financial Center'), icon: faUniversity },
    { to: '/stadium', label: t('Stadium Management'), icon: faWarehouse },
    { to: '/facilities', label: t('Facilities'), icon: faBuilding },
    { to: '/compliance', label: t('Compliance'), icon: faBalanceScale },
    { to: '/leagues', label: t('League Management'), icon: faTrophy },
    { to: '/team-selection', label: t('Team Selection & Tactics'), icon: faClipboardList },
    { to: '/club-history', label: t('Club History'), icon: faHistory },
  ];

  return (
    <nav
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: '8px 0',
        background: 'rgba(34, 40, 49, 0.82)',
        boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
        borderBottom: '1.5px solid rgba(255,255,255,0.10)',
        fontSize: '1.13rem',
        minHeight: 54,
        overflow: 'hidden',
        width: '100%',
        fontFamily: 'Bebas Neue, Orbitron, Arial Black, sans-serif',
        fontWeight: 700,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      aria-label="Game Navigation Menu"
    >
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400;700&family=Orbitron:wght@700&display=swap" rel="stylesheet" />
      <style>{`
        .game-menu-link {
          color: #fff;
          text-decoration: none;
          padding: 6px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
          font-size: 1.13rem;
        }
        .game-menu-link:focus {
          outline: 2px solid #4ade80;
          outline-offset: 2px;
        }
        .game-menu-link:hover, .game-menu-link:active {
          background: rgba(34, 197, 94, 0.13);
          color: #4ade80;
          box-shadow: 0 2px 12px #22d3ee33;
        }
        .game-menu-link::after {
          content: '';
          display: block;
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 4px;
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, #4ade80 0%, #22d3ee 100%);
          opacity: 0;
          transition: opacity 0.18s;
        }
        .game-menu-link:hover::after, .game-menu-link:active::after {
          opacity: 1;
        }
      `}</style>
      {menuItems.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className="game-menu-link"
          tabIndex={0}
          aria-label={item.label}
        >
          <span className="menu-icon"><FontAwesomeIcon icon={item.icon} /></span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 
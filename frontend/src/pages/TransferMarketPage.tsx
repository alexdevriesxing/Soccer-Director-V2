import React from 'react';
import TransferMarketPanel from '../components/TransferMarketPanel';

const TransferMarketPage: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 }}>
    <TransferMarketPanel />
  </div>
);

export default TransferMarketPage; 
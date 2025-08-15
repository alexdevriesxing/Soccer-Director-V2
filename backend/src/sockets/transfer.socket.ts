import { Server } from 'socket.io';
import logger from '../utils/logger';

export function setupTransferSocket(io: Server) {
  const transferNamespace = io.of('/transfers');
  
  transferNamespace.on('connection', (socket) => {
    logger.info('Client connected to transfer namespace');
    
    // Join club-specific room
    socket.on('join-club', (clubId: number) => {
      const roomName = `club-${clubId}`;
      socket.join(roomName);
      logger.info(`Client joined club room: ${roomName}`);
    });
    
    // Join player-specific room
    socket.on('join-player', (playerId: number) => {
      const roomName = `player-${playerId}`;
      socket.join(roomName);
      logger.info(`Client joined player room: ${roomName}`);
    });
    
    socket.on('disconnect', () => {
      logger.info('Client disconnected from transfer namespace');
    });
  });
  // TODO: Re-introduce DB-backed event propagation once transfer domain events are standardized.
}

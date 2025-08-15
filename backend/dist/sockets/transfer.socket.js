"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTransferSocket = setupTransferSocket;
const logger_1 = __importDefault(require("../utils/logger"));
function setupTransferSocket(io) {
    const transferNamespace = io.of('/transfers');
    transferNamespace.on('connection', (socket) => {
        logger_1.default.info('Client connected to transfer namespace');
        // Join club-specific room
        socket.on('join-club', (clubId) => {
            const roomName = `club-${clubId}`;
            socket.join(roomName);
            logger_1.default.info(`Client joined club room: ${roomName}`);
        });
        // Join player-specific room
        socket.on('join-player', (playerId) => {
            const roomName = `player-${playerId}`;
            socket.join(roomName);
            logger_1.default.info(`Client joined player room: ${roomName}`);
        });
        socket.on('disconnect', () => {
            logger_1.default.info('Client disconnected from transfer namespace');
        });
    });
    // TODO: Re-introduce DB-backed event propagation once transfer domain events are standardized.
}

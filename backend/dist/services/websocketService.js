"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocketService = exports.initWebSocketService = exports.WebSocketService = void 0;
const ws_1 = require("ws");
const liveMatchService_1 = require("./liveMatchService");
class WebSocketService {
    constructor(server) {
        this.clients = new Set();
        this.matchUpdateIntervals = new Map();
        this.wss = new ws_1.WebSocketServer({ server });
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            const client = { socket: ws, fixtureId: null };
            this.clients.add(client);
            console.log('New WebSocket connection');
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(client, data);
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
            ws.on('close', () => {
                this.clients.delete(client);
                console.log('WebSocket connection closed');
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(client);
            });
        });
    }
    handleMessage(client, data) {
        switch (data.type) {
            case 'SUBSCRIBE_MATCH':
                this.handleSubscribeMatch(client, data.fixtureId);
                break;
            case 'UNSUBSCRIBE_MATCH':
                this.handleUnsubscribeMatch(client);
                break;
            case 'MATCH_CONTROL':
                this.handleMatchControl(data);
                break;
            default:
                console.warn('Unknown message type:', data.type);
        }
    }
    handleSubscribeMatch(client, fixtureId) {
        // Unsubscribe from previous match if any
        if (client.fixtureId) {
            this.handleUnsubscribeMatch(client);
        }
        client.fixtureId = fixtureId;
        console.log(`Client subscribed to match ${fixtureId}`);
        // Send initial match state
        this.sendMatchState(fixtureId, client.socket);
        // Start match updates if not already running
        if (!this.matchUpdateIntervals.has(fixtureId)) {
            this.startMatchUpdates(fixtureId);
        }
    }
    handleUnsubscribeMatch(client) {
        if (client.fixtureId !== null) {
            console.log(`Client unsubscribed from match ${client.fixtureId}`);
            client.fixtureId = null;
            this.cleanupMatchUpdates();
        }
    }
    handleMatchControl(data) {
        const { fixtureId, action } = data;
        switch (action) {
            case 'START':
                liveMatchService_1.LiveMatchService.startMatch(fixtureId);
                break;
            case 'PAUSE':
                liveMatchService_1.LiveMatchService.pauseMatch(fixtureId);
                break;
            case 'RESET':
                // Reset match logic here if needed
                break;
            default:
                console.warn('Unknown match control action:', action);
        }
    }
    startMatchUpdates(fixtureId) {
        const interval = setInterval(() => {
            this.broadcastMatchState(fixtureId);
        }, 100); // Update 10 times per second
        this.matchUpdateIntervals.set(fixtureId, interval);
    }
    stopMatchUpdates(fixtureId) {
        const interval = this.matchUpdateIntervals.get(fixtureId);
        if (interval) {
            clearInterval(interval);
            this.matchUpdateIntervals.delete(fixtureId);
        }
    }
    cleanupMatchUpdates() {
        // Clean up intervals for matches with no subscribers
        const activeFixtureIds = new Set();
        this.clients.forEach(client => {
            if (client.fixtureId !== null) {
                activeFixtureIds.add(client.fixtureId);
            }
        });
        // Stop updates for matches with no subscribers
        Array.from(this.matchUpdateIntervals.keys()).forEach(fixtureId => {
            if (!activeFixtureIds.has(fixtureId)) {
                this.stopMatchUpdates(fixtureId);
            }
        });
    }
    broadcastMatchState(fixtureId) {
        const matchState = liveMatchService_1.LiveMatchService.getMatchState(fixtureId);
        if (!matchState)
            return;
        const clients = Array.from(this.clients).filter(client => client.fixtureId === fixtureId);
        if (clients.length === 0)
            return;
        const message = JSON.stringify({
            type: 'MATCH_UPDATE',
            data: matchState
        });
        clients.forEach(client => {
            if (client.socket.readyState === ws_1.WebSocket.OPEN) {
                client.socket.send(message);
            }
        });
    }
    sendMatchState(fixtureId, ws) {
        const matchState = liveMatchService_1.LiveMatchService.getMatchState(fixtureId);
        if (!matchState)
            return;
        const message = JSON.stringify({
            type: 'MATCH_UPDATE',
            data: matchState
        });
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(message);
        }
    }
    getMatchClients(fixtureId) {
        return Array.from(this.clients).filter((client) => client.fixtureId === fixtureId);
    }
    static getLiveMatches() {
        return Array.from(liveMatchService_1.LiveMatchService.getLiveMatchIds());
    }
    static getCurrentMinute(fixtureId) {
        const matchState = liveMatchService_1.LiveMatchService.getMatchState(fixtureId);
        return (matchState === null || matchState === void 0 ? void 0 : matchState.currentMinute) || null;
    }
    broadcastEvent(fixtureId, event) {
        const clients = Array.from(this.clients).filter(client => client.fixtureId === fixtureId);
        if (clients.length === 0)
            return;
        const message = JSON.stringify({
            type: 'MATCH_EVENT',
            data: event
        });
        clients.forEach(client => {
            if (client.socket.readyState === ws_1.WebSocket.OPEN) {
                client.socket.send(message);
            }
        });
    }
}
exports.WebSocketService = WebSocketService;
// Singleton instance
let webSocketService = null;
const initWebSocketService = (server) => {
    if (!webSocketService) {
        webSocketService = new WebSocketService(server);
    }
    return webSocketService;
};
exports.initWebSocketService = initWebSocketService;
const getWebSocketService = () => {
    if (!webSocketService) {
        throw new Error('WebSocketService not initialized');
    }
    return webSocketService;
};
exports.getWebSocketService = getWebSocketService;

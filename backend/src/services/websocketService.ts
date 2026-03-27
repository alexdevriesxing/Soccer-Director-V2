import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { LiveMatchService } from './liveMatchService';

type Client = {
  socket: WebSocket;
  fixtureId: number | null;
};

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<Client> = new Set();
  private matchUpdateIntervals: Map<number, NodeJS.Timeout> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      const client: Client = { socket: ws, fixtureId: null };
      this.clients.add(client);

      console.log('New WebSocket connection');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(client, data);
        } catch (error) {
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

  private handleMessage(client: Client, data: any) {
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

  private handleSubscribeMatch(client: Client, fixtureId: number) {
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

  private handleUnsubscribeMatch(client: Client) {
    if (client.fixtureId !== null) {
      console.log(`Client unsubscribed from match ${client.fixtureId}`);
      client.fixtureId = null;
      this.cleanupMatchUpdates();
    }
  }

  private handleMatchControl(data: any) {
    const { fixtureId, action } = data;

    switch (action) {
      case 'START':
        LiveMatchService.startMatch(fixtureId);
        // Send updates to clients
        // Note: The original instruction provided a socket.io specific snippet.
        // Adapting to the existing 'ws' and 'broadcastMatchState' pattern.
        // The comment about 'activeMatch as any' is preserved as per instruction,
        // though 'broadcastMatchState' handles the state retrieval internally.
        const activeMatch = LiveMatchService.getMatchState(fixtureId);
        if (activeMatch) {
          this.broadcastMatchState(fixtureId); // This will send the updated state to all subscribed clients
          // The original instruction's comment about casting 'currentMinute' is noted here,
          // as 'broadcastMatchState' internally retrieves the full match state which includes 'currentMinute'.
          // minute: (activeMatch as any).currentMinute || 0, // Cast to any as currentMinute might be missing in type
        }
        break;
      case 'PAUSE':
        LiveMatchService.pauseMatch(fixtureId);
        break;
      case 'RESET':
        // Reset match logic here if needed
        break;
      default:
        console.warn('Unknown match control action:', action);
    }
  }

  private startMatchUpdates(fixtureId: number) {
    const interval = setInterval(() => {
      this.broadcastMatchState(fixtureId);
    }, 100); // Update 10 times per second

    this.matchUpdateIntervals.set(fixtureId, interval);
  }

  private stopMatchUpdates(fixtureId: number) {
    const interval = this.matchUpdateIntervals.get(fixtureId);
    if (interval) {
      clearInterval(interval);
      this.matchUpdateIntervals.delete(fixtureId);
    }
  }

  private cleanupMatchUpdates() {
    // Clean up intervals for matches with no subscribers
    const activeFixtureIds = new Set<number>();

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

  private broadcastMatchState(fixtureId: number) {
    const matchState = LiveMatchService.getMatchState(fixtureId);
    if (!matchState) return;

    const clients = Array.from(this.clients).filter(
      client => client.fixtureId === fixtureId
    );

    if (clients.length === 0) return;

    const message = JSON.stringify({
      type: 'MATCH_UPDATE',
      data: matchState
    });

    clients.forEach(client => {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }

  private sendMatchState(fixtureId: number, ws: WebSocket) {
    const matchState = LiveMatchService.getMatchState(fixtureId);
    if (!matchState) return;

    const message = JSON.stringify({
      type: 'MATCH_UPDATE',
      data: matchState
    });

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }

  /*
  private getMatchClients(matchId: number): Set<any> {
    // Stub
    return new Set();
  }
  */
  // The original implementation of getMatchClients was here, but it's now commented out as per instruction.
  // The instruction also included `Array.from(this.clients).filter(...)` outside the comment block,
  // which would be a syntax error. Assuming the intent was to comment out the entire method.
  // If this method is needed, it should be uncommented or re-implemented.

  public static getLiveMatches(): number[] {
    return Array.from(LiveMatchService.getLiveMatchIds());
  }

  public static getCurrentMinute(fixtureId: number): number | null {
    const matchState = LiveMatchService.getMatchState(fixtureId);
    return (matchState as any)?.currentMinute || null;
  }

  /*
    private getMatchClients(fixtureId: number): Client[] {
      return Array.from(this.clients).filter(
        (client) => client.fixtureId === fixtureId
      );
    }
  */
  public broadcastEvent(fixtureId: number, event: any) {
    const clients = Array.from(this.clients).filter(
      client => client.fixtureId === fixtureId
    );

    if (clients.length === 0) return;

    const message = JSON.stringify({
      type: 'MATCH_EVENT',
      data: event
    });

    clients.forEach(client => {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

export const initWebSocketService = (server: Server): WebSocketService => {
  if (!webSocketService) {
    webSocketService = new WebSocketService(server);
  }
  return webSocketService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!webSocketService) {
    throw new Error('WebSocketService not initialized');
  }
  return webSocketService;
};

import { Socket } from 'socket.io';
export declare class RealtimeService {
    private readonly logger;
    private connections;
    private userConnections;
    addConnection(clientId: string, socket: Socket, userId: string): void;
    removeConnection(clientId: string): void;
    getUserIdByClientId(clientId: string): string | null;
    broadcastToAll(event: string, data: any): void;
    broadcastToRoom(room: string, event: string, data: any): void;
    broadcastToUser(userId: string, event: string, data: any): void;
    emitToClient(clientId: string, event: string, data: any): void;
    getConnectionCount(): number;
    getActiveUsers(): number;
}

import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly realtimeService;
    private readonly logger;
    constructor(realtimeService: RealtimeService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, data: {
        channel: string;
    }): {
        status: string;
        channel: string;
    };
    handleUnsubscribe(client: Socket, data: {
        channel: string;
    }): {
        status: string;
        channel: string;
    };
    handlePing(): {
        pong: number;
    };
}

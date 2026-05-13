import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeService } from './realtime.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly realtimeService;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(realtimeService: RealtimeService, jwtService: JwtService, configService: ConfigService);
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

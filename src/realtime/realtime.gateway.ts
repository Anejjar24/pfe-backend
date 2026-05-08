import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  BaseWsExceptionFilter,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    this.realtimeService.addConnection(client.id, client, userId);
  }

  handleDisconnect(client: Socket) {
    const userId = this.realtimeService.getUserIdByClientId(client.id);
    this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    this.realtimeService.removeConnection(client.id);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    const { channel } = data;
    client.join(`channel:${channel}`);
    this.logger.debug(`Client ${client.id} subscribed to ${channel}`);
    return { status: 'subscribed', channel };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    const { channel } = data;
    client.leave(`channel:${channel}`);
    this.logger.debug(`Client ${client.id} unsubscribed from ${channel}`);
    return { status: 'unsubscribed', channel };
  }

  @SubscribeMessage('ping')
  handlePing(): { pong: number } {
    return { pong: Date.now() };
  }
}

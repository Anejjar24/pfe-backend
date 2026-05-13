"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RealtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
let RealtimeService = RealtimeService_1 = class RealtimeService {
    constructor() {
        this.logger = new common_1.Logger(RealtimeService_1.name);
        this.connections = new Map();
        this.userConnections = new Map();
    }
    addConnection(clientId, socket, userId) {
        this.connections.set(clientId, socket);
        if (!this.userConnections.has(userId)) {
            this.userConnections.set(userId, []);
        }
        this.userConnections.get(userId)?.push(clientId);
        this.logger.debug(`Connection added: ${clientId} for user ${userId}. Total: ${this.connections.size}`);
    }
    removeConnection(clientId) {
        const socket = this.connections.get(clientId);
        if (socket) {
            this.connections.delete(clientId);
            for (const [userId, clientIds] of this.userConnections.entries()) {
                const index = clientIds.indexOf(clientId);
                if (index > -1) {
                    clientIds.splice(index, 1);
                    if (clientIds.length === 0) {
                        this.userConnections.delete(userId);
                    }
                    break;
                }
            }
            this.logger.debug(`Connection removed: ${clientId}. Total: ${this.connections.size}`);
        }
    }
    getUserIdByClientId(clientId) {
        for (const [userId, clientIds] of this.userConnections.entries()) {
            if (clientIds.includes(clientId)) {
                return userId;
            }
        }
        return null;
    }
    broadcastToAll(event, data) {
        this.connections.forEach((socket) => {
            socket.emit(event, data);
        });
        this.logger.debug(`Broadcast to all: ${event}`);
    }
    broadcastToRoom(room, event, data) {
        this.connections.forEach((socket) => {
            if (socket.rooms.has(room)) {
                socket.emit(event, data);
            }
        });
        this.logger.debug(`Broadcast to room ${room}: ${event}`);
    }
    broadcastToUser(userId, event, data) {
        const clientIds = this.userConnections.get(userId);
        if (clientIds) {
            clientIds.forEach((clientId) => {
                const socket = this.connections.get(clientId);
                if (socket) {
                    socket.emit(event, data);
                }
            });
            this.logger.debug(`Broadcast to user ${userId}: ${event}`);
        }
    }
    emitToClient(clientId, event, data) {
        const socket = this.connections.get(clientId);
        if (socket) {
            socket.emit(event, data);
            this.logger.debug(`Emit to client ${clientId}: ${event}`);
        }
    }
    getConnectionCount() {
        return this.connections.size;
    }
    getActiveUsers() {
        return this.userConnections.size;
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = RealtimeService_1 = __decorate([
    (0, common_1.Injectable)()
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map
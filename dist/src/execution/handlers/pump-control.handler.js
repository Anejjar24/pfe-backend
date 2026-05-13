"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpControlHandler = void 0;
class PumpControlHandler {
    constructor(mqttClient) {
        this.mqttClient = mqttClient;
    }
    async execute(node, input) {
        const deviceId = String(node.data?.deviceId || '').trim();
        const command = String(node.data?.command || 'start');
        const topicOverride = node.data?.topic ? String(node.data.topic).trim() : '';
        const topic = topicOverride || `devices/${deviceId}/commands`;
        if (!deviceId) {
            return { error: 'deviceId not configured', sent: false };
        }
        const payload = {
            command,
            deviceId,
            timestamp: new Date().toISOString(),
            source: 'workflow',
        };
        await this.mqttClient.publish(topic, payload);
        return { sent: true, command, deviceId, topic };
    }
}
exports.PumpControlHandler = PumpControlHandler;
//# sourceMappingURL=pump-control.handler.js.map
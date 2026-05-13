"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttPublishHandler = void 0;
class MqttPublishHandler {
    constructor(mqttClient) {
        this.mqttClient = mqttClient;
    }
    async execute(node, input) {
        const topic = String(node.data?.topic || 'aquaflow/commands');
        let staticPayload = {};
        try {
            staticPayload = JSON.parse(String(node.data?.payload || '{}'));
        }
        catch {
        }
        const payload = typeof input === 'object' && input !== null
            ? { ...staticPayload, ...input }
            : { ...staticPayload, value: input };
        await this.mqttClient.publish(topic, payload);
        return { published: true, topic, payload };
    }
}
exports.MqttPublishHandler = MqttPublishHandler;
//# sourceMappingURL=mqtt-publish.handler.js.map
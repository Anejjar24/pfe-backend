import { MqttClient } from '../../iot/mqtt/mqtt.client';
import { WorkflowNode } from '../../common/types/workflow.types';
export declare class MqttPublishHandler {
    private readonly mqttClient;
    constructor(mqttClient: MqttClient);
    execute(node: WorkflowNode, input: unknown): Promise<{
        published: boolean;
        topic: string;
        payload: {
            [x: string]: unknown;
        } | {
            value: unknown;
        };
    }>;
}

import { MqttClient } from '../../iot/mqtt/mqtt.client';
import { WorkflowNode } from '../../common/types/workflow.types';
export declare class PumpControlHandler {
    private readonly mqttClient;
    constructor(mqttClient: MqttClient);
    execute(node: WorkflowNode, input: unknown): Promise<{
        error: string;
        sent: boolean;
        command?: undefined;
        deviceId?: undefined;
        topic?: undefined;
    } | {
        sent: boolean;
        command: string;
        deviceId: string;
        topic: string;
        error?: undefined;
    }>;
}

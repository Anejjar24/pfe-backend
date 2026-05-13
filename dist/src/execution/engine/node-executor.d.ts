import { Repository } from 'typeorm';
import { AlertsService } from '../../alerts/alerts.service';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
import { MqttClient } from '../../iot/mqtt/mqtt.client';
import { StationsService } from '../../stations/stations.service';
import { ExecutionContext } from './execution-context';
export declare class NodeExecutor {
    private readonly inputHandler;
    private readonly actionHandler;
    private readonly decisionHandler;
    private readonly outputHandler;
    private readonly thresholdCheckHandler;
    private readonly httpRequestHandler;
    private readonly sensorReadHandler;
    private readonly alertTriggerHandler;
    private readonly mqttPublishHandler;
    private readonly pumpControlHandler;
    private readonly stationControlHandler;
    constructor(sensorRepository: Repository<Sensor>, alertsService: AlertsService, mqttClient: MqttClient, stationsService: StationsService);
    execute(node: WorkflowNode, input: unknown, context: ExecutionContext): Promise<unknown>;
    private handleDelay;
}

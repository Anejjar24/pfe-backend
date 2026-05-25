import { Repository } from 'typeorm';
import { AlertsService } from '../../alerts/alerts.service';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
import { Notification } from '../../database/entities/Notification.entity';
import { MqttClient } from '../../iot/mqtt/mqtt.client';
import { RealtimeService } from '../../realtime/realtime.service';
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
    private readonly notificationHandler;
    private readonly pumpControlHandler;
    private readonly stationControlHandler;
    constructor(sensorRepository: Repository<Sensor>, notificationRepository: Repository<Notification>, alertsService: AlertsService, mqttClient: MqttClient, realtimeService: RealtimeService, stationsService: StationsService);
    execute(node: WorkflowNode, input: unknown, context: ExecutionContext): Promise<unknown>;
    private handleDelay;
}

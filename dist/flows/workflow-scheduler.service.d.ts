import { OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Workflow } from '../database/entities/Workflow.entity';
import { FlowExecutorService } from './flow-executor.service';
import { MqttClient } from '../iot/mqtt/mqtt.client';
export declare class WorkflowSchedulerService implements OnModuleInit {
    private readonly workflowRepo;
    private readonly executorService;
    private readonly schedulerRegistry;
    private readonly mqttClient;
    private readonly logger;
    constructor(workflowRepo: Repository<Workflow>, executorService: FlowExecutorService, schedulerRegistry: SchedulerRegistry, mqttClient: MqttClient);
    onModuleInit(): Promise<void>;
    loadScheduledWorkflows(): Promise<void>;
    registerCronJob(workflow: Workflow): void;
    reloadWorkflow(workflowId: string): Promise<void>;
    registerSensorThresholdHandler(): void;
}

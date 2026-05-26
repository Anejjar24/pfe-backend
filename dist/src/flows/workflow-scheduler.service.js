"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkflowSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const typeorm_2 = require("typeorm");
const cron_1 = require("cron");
const Workflow_entity_1 = require("../database/entities/Workflow.entity");
const flow_executor_service_1 = require("./flow-executor.service");
const mqtt_client_1 = require("../iot/mqtt/mqtt.client");
let WorkflowSchedulerService = WorkflowSchedulerService_1 = class WorkflowSchedulerService {
    constructor(workflowRepo, executorService, schedulerRegistry, mqttClient) {
        this.workflowRepo = workflowRepo;
        this.executorService = executorService;
        this.schedulerRegistry = schedulerRegistry;
        this.mqttClient = mqttClient;
        this.logger = new common_1.Logger(WorkflowSchedulerService_1.name);
    }
    async onModuleInit() {
        try {
            await this.loadScheduledWorkflows();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Failed to load scheduled workflows on startup: ${msg}`);
        }
        this.registerSensorThresholdHandler();
    }
    async loadScheduledWorkflows() {
        const workflows = await this.workflowRepo.find({
            where: { isActive: true, triggerType: Workflow_entity_1.WorkflowTriggerType.SCHEDULED },
        });
        this.logger.log(`Loaded ${workflows.length} scheduled workflow(s)`);
        for (const workflow of workflows) {
            this.registerCronJob(workflow);
        }
    }
    registerCronJob(workflow) {
        const cron = workflow.triggerConfig?.cron;
        if (!cron) {
            this.logger.warn(`Workflow "${workflow.name}" (${workflow.id}) has no cron expression — skipping`);
            return;
        }
        const jobName = `wf:${workflow.id}`;
        try {
            this.schedulerRegistry.deleteCronJob(jobName);
        }
        catch {
        }
        try {
            const job = new cron_1.CronJob(cron, async () => {
                this.logger.log(`Running scheduled workflow: "${workflow.name}" (${workflow.id})`);
                try {
                    await this.executorService.execute(workflow.graph, {}, {
                        workflowId: workflow.id,
                        triggerSource: 'scheduled',
                    });
                }
                catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    this.logger.error(`Scheduled workflow "${workflow.name}" failed: ${msg}`);
                }
            });
            this.schedulerRegistry.addCronJob(jobName, job);
            job.start();
            this.logger.log(`Registered cron "${cron}" for workflow "${workflow.name}"`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Could not register cron for workflow "${workflow.name}" (${workflow.id}): ${msg}`);
        }
    }
    async reloadWorkflow(workflowId) {
        const jobName = `wf:${workflowId}`;
        try {
            this.schedulerRegistry.deleteCronJob(jobName);
        }
        catch {
        }
        const workflow = await this.workflowRepo.findOne({ where: { id: workflowId } });
        if (!workflow)
            return;
        if (workflow.isActive && workflow.triggerType === Workflow_entity_1.WorkflowTriggerType.SCHEDULED) {
            this.registerCronJob(workflow);
        }
        else {
            this.logger.log(`Workflow "${workflow.name}" is inactive or not scheduled — cron job removed`);
        }
    }
    registerSensorThresholdHandler() {
        this.mqttClient.registerHandler(async (topic, payload) => {
            if (!topic.startsWith('sensors/') || !topic.endsWith('/data'))
                return;
            const parts = topic.split('/');
            const sensorId = parts[1];
            if (!sensorId)
                return;
            let value;
            try {
                const message = JSON.parse(payload.toString());
                const raw = message?.value;
                value = typeof raw === 'number' ? raw : Number(raw);
                if (Number.isNaN(value))
                    return;
            }
            catch {
                return;
            }
            let workflows;
            try {
                workflows = await this.workflowRepo.find({
                    where: { isActive: true, triggerType: Workflow_entity_1.WorkflowTriggerType.SENSOR_THRESHOLD },
                });
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Failed to query sensor_threshold workflows: ${msg}`);
                return;
            }
            for (const workflow of workflows) {
                const config = workflow.triggerConfig;
                if (!config || config['sensorId'] !== sensorId)
                    continue;
                const threshold = Number(config['threshold'] ?? 0);
                const condition = String(config['condition'] ?? 'any');
                const triggered = condition === 'any' ||
                    (condition === 'above' && value > threshold) ||
                    (condition === 'below' && value < threshold);
                if (!triggered)
                    continue;
                this.logger.log(`MQTT trigger: workflow "${workflow.name}" fired — sensor ${sensorId} = ${value} (${condition} ${threshold})`);
                this.executorService
                    .execute(workflow.graph, { sensorId, value }, {
                    workflowId: workflow.id,
                    triggerSource: 'sensor_threshold',
                })
                    .catch((err) => {
                    const msg = err instanceof Error ? err.message : String(err);
                    this.logger.error(`MQTT-triggered workflow "${workflow.name}" failed: ${msg}`);
                });
            }
        });
    }
};
exports.WorkflowSchedulerService = WorkflowSchedulerService;
exports.WorkflowSchedulerService = WorkflowSchedulerService = WorkflowSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Workflow_entity_1.Workflow)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        flow_executor_service_1.FlowExecutorService,
        schedule_1.SchedulerRegistry,
        mqtt_client_1.MqttClient])
], WorkflowSchedulerService);
//# sourceMappingURL=workflow-scheduler.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const alerts_module_1 = require("../alerts/alerts.module");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const Workflow_entity_1 = require("../database/entities/Workflow.entity");
const Notification_entity_1 = require("../database/entities/Notification.entity");
const WorkflowExecution_entity_1 = require("../database/entities/WorkflowExecution.entity");
const iot_module_1 = require("../iot/iot.module");
const realtime_module_1 = require("../realtime/realtime.module");
const stations_module_1 = require("../stations/stations.module");
const node_executor_1 = require("../execution/engine/node-executor");
const workflow_runner_1 = require("../execution/engine/workflow-runner");
const flow_executor_service_1 = require("./flow-executor.service");
const flow_validator_service_1 = require("./flow-validator.service");
const flows_controller_1 = require("./flows.controller");
const flows_service_1 = require("./flows.service");
let FlowsModule = class FlowsModule {
};
exports.FlowsModule = FlowsModule;
exports.FlowsModule = FlowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([Workflow_entity_1.Workflow, Sensor_entity_1.Sensor, Notification_entity_1.Notification, WorkflowExecution_entity_1.WorkflowExecution]),
            alerts_module_1.AlertsModule,
            iot_module_1.IotModule,
            realtime_module_1.RealtimeModule,
            stations_module_1.StationsModule,
        ],
        controllers: [flows_controller_1.FlowsController],
        providers: [
            flow_executor_service_1.FlowExecutorService,
            flow_validator_service_1.FlowValidatorService,
            flows_service_1.FlowsService,
            node_executor_1.NodeExecutor,
            workflow_runner_1.WorkflowRunner,
        ],
    })
], FlowsModule);
//# sourceMappingURL=flows.module.js.map
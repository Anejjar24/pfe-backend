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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeExecutor = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alerts_service_1 = require("../../alerts/alerts.service");
const Sensor_entity_1 = require("../../database/entities/Sensor.entity");
const SensorData_entity_1 = require("../../database/entities/SensorData.entity");
const Notification_entity_1 = require("../../database/entities/Notification.entity");
const mqtt_client_1 = require("../../iot/mqtt/mqtt.client");
const realtime_service_1 = require("../../realtime/realtime.service");
const stations_service_1 = require("../../stations/stations.service");
const action_handler_1 = require("../handlers/action.handler");
const data_transform_handler_1 = require("../handlers/data-transform.handler");
const decision_handler_1 = require("../handlers/decision.handler");
const http_request_handler_1 = require("../handlers/http-request.handler");
const input_handler_1 = require("../handlers/input.handler");
const notification_handler_1 = require("../handlers/notification.handler");
const output_handler_1 = require("../handlers/output.handler");
const threshold_check_handler_1 = require("../handlers/threshold-check.handler");
const alert_trigger_handler_1 = require("../handlers/alert-trigger.handler");
const mqtt_publish_handler_1 = require("../handlers/mqtt-publish.handler");
const pump_control_handler_1 = require("../handlers/pump-control.handler");
const sensor_read_handler_1 = require("../handlers/sensor-read.handler");
const station_control_handler_1 = require("../handlers/station-control.handler");
const data_aggregate_handler_1 = require("../handlers/data-aggregate.handler");
const data_output_handler_1 = require("../handlers/data-output.handler");
const sensor_check_handler_1 = require("../handlers/sensor-check.handler");
const stream_filter_handler_1 = require("../handlers/stream-filter.handler");
const value_transform_handler_1 = require("../handlers/value-transform.handler");
const custom_calc_handler_1 = require("../handlers/custom-calc.handler");
let NodeExecutor = class NodeExecutor {
    constructor(sensorRepository, sensorDataRepository, notificationRepository, alertsService, mqttClient, realtimeService, stationsService) {
        this.inputHandler = new input_handler_1.InputHandler();
        this.actionHandler = new action_handler_1.ActionHandler();
        this.dataTransformHandler = new data_transform_handler_1.DataTransformHandler();
        this.decisionHandler = new decision_handler_1.DecisionHandler();
        this.outputHandler = new output_handler_1.OutputHandler();
        this.thresholdCheckHandler = new threshold_check_handler_1.ThresholdCheckHandler();
        this.httpRequestHandler = new http_request_handler_1.HttpRequestHandler();
        this.valueTransformHandler = new value_transform_handler_1.ValueTransformHandler();
        this.sensorCheckHandler = new sensor_check_handler_1.SensorCheckHandler();
        this.streamFilterHandler = new stream_filter_handler_1.StreamFilterHandler();
        this.sensorReadHandler = new sensor_read_handler_1.SensorReadHandler(sensorRepository, sensorDataRepository);
        this.alertTriggerHandler = new alert_trigger_handler_1.AlertTriggerHandler(alertsService);
        this.mqttPublishHandler = new mqtt_publish_handler_1.MqttPublishHandler(mqttClient);
        this.notificationHandler = new notification_handler_1.NotificationHandler(notificationRepository, realtimeService);
        this.pumpControlHandler = new pump_control_handler_1.PumpControlHandler(mqttClient);
        this.stationControlHandler = new station_control_handler_1.StationControlHandler(stationsService);
        this.dataAggregateHandler = new data_aggregate_handler_1.DataAggregateHandler(sensorRepository);
        this.dataOutputHandler = new data_output_handler_1.DataOutputHandler(sensorDataRepository, sensorRepository);
        this.customCalcHandler = new custom_calc_handler_1.CustomCalcHandler(sensorRepository, sensorDataRepository);
    }
    async execute(node, input, context) {
        switch (node.type) {
            case 'input': return this.inputHandler.execute(node, context);
            case 'action': return this.actionHandler.execute(node, input);
            case 'data-transform': return this.dataTransformHandler.execute(node, input);
            case 'decision': return this.decisionHandler.execute(node, input);
            case 'output': return this.outputHandler.execute(node, input);
            case 'delay': return this.handleDelay(node, input);
            case 'notification': return this.notificationHandler.execute(node, input);
            case 'api': return this.httpRequestHandler.execute(node, input);
            case 'sensor-read': return this.sensorReadHandler.execute(node, input);
            case 'threshold-check': return this.thresholdCheckHandler.execute(node, input);
            case 'alert-trigger': return this.alertTriggerHandler.execute(node, input);
            case 'mqtt-publish': return this.mqttPublishHandler.execute(node, input);
            case 'pump-control': return this.pumpControlHandler.execute(node, input);
            case 'station-control': return this.stationControlHandler.execute(node, input);
            case 'value-transform': return this.valueTransformHandler.execute(node, input);
            case 'sensor-check': return this.sensorCheckHandler.execute(node, input);
            case 'data-aggregate': return this.dataAggregateHandler.execute(node, input);
            case 'stream-filter': return this.streamFilterHandler.execute(node, input);
            case 'data-output': return this.dataOutputHandler.execute(node, input);
            case 'http-request': return this.httpRequestHandler.execute(node, input);
            case 'custom-calc': return this.customCalcHandler.execute(node, input);
            default: return input;
        }
    }
    async handleDelay(node, input) {
        const ms = Math.min(Number(node.data?.durationMs ?? 500), 30_000);
        await new Promise((resolve) => setTimeout(resolve, ms));
        return input;
    }
};
exports.NodeExecutor = NodeExecutor;
exports.NodeExecutor = NodeExecutor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Sensor_entity_1.Sensor)),
    __param(1, (0, typeorm_1.InjectRepository)(SensorData_entity_1.SensorData)),
    __param(2, (0, typeorm_1.InjectRepository)(Notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        alerts_service_1.AlertsService,
        mqtt_client_1.MqttClient,
        realtime_service_1.RealtimeService,
        stations_service_1.StationsService])
], NodeExecutor);
//# sourceMappingURL=node-executor.js.map
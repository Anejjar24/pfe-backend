"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const realtime_module_1 = require("../realtime/realtime.module");
const alerts_module_1 = require("../alerts/alerts.module");
const iot_service_1 = require("./iot.service");
const mqtt_client_1 = require("./mqtt/mqtt.client");
let IotModule = class IotModule {
};
exports.IotModule = IotModule;
exports.IotModule = IotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([Sensor_entity_1.Sensor, SensorData_entity_1.SensorData]),
            realtime_module_1.RealtimeModule,
            alerts_module_1.AlertsModule,
        ],
        providers: [iot_service_1.IotService, mqtt_client_1.MqttClient],
        exports: [iot_service_1.IotService],
    })
], IotModule);
//# sourceMappingURL=iot.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const Maintenance_entity_1 = require("../database/entities/Maintenance.entity");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorAggregate_entity_1 = require("../database/entities/SensorAggregate.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const iot_module_1 = require("../iot/iot.module");
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([Station_entity_1.Station, Sensor_entity_1.Sensor, Alert_entity_1.Alert, Maintenance_entity_1.Maintenance, SensorData_entity_1.SensorData, SensorAggregate_entity_1.SensorAggregate]),
            iot_module_1.IotModule,
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map
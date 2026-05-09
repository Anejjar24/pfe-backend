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
var IotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const alerts_service_1 = require("../alerts/alerts.service");
const Alert_entity_1 = require("../database/entities/Alert.entity");
let IotService = IotService_1 = class IotService {
    constructor(sensorRepository, sensorDataRepository, realtimeService, alertsService) {
        this.sensorRepository = sensorRepository;
        this.sensorDataRepository = sensorDataRepository;
        this.realtimeService = realtimeService;
        this.alertsService = alertsService;
        this.logger = new common_1.Logger(IotService_1.name);
    }
    async processSensorData(sensorId, value) {
        try {
            const sensor = await this.sensorRepository.findOne({
                where: { id: sensorId },
            });
            if (!sensor) {
                this.logger.warn(`Sensor not found: ${sensorId}`);
                return;
            }
            sensor.lastReading = value;
            sensor.lastReadingAt = new Date();
            sensor.status = Sensor_entity_1.SensorStatus.ACTIVE;
            const thresholdViolated = sensor.isThresholdViolated;
            await this.sensorRepository.save(sensor);
            const sensorData = this.sensorDataRepository.create({
                sensor,
                value,
                timestamp: new Date(),
                qualityFlags: {},
            });
            await this.sensorDataRepository.save(sensorData);
            this.realtimeService.broadcastToAll('sensor-update', {
                sensorId: sensor.id,
                stationId: sensor.station?.id,
                value,
                timestamp: new Date(),
                thresholdViolated,
                status: sensor.status,
            });
            if (thresholdViolated && sensor.alertEnabled) {
                this.logger.warn(`Threshold violation for sensor ${sensorId}: ${value}`);
                try {
                    const severity = Alert_entity_1.AlertSeverity.WARNING;
                    const message = `Threshold violation on sensor ${sensor.name}: ${value}`;
                    const description = `Sensor reading ${value} violates thresholds (min: ${sensor.minThreshold}, max: ${sensor.maxThreshold})`;
                    await this.alertsService.create({
                        type: Alert_entity_1.AlertType.THRESHOLD_VIOLATION,
                        severity,
                        message,
                        description,
                        stationId: sensor.station?.id,
                        sensorId: sensor.id,
                        sourceSystem: 'iot-mqtt',
                        data: {
                            value,
                            minThreshold: sensor.minThreshold,
                            maxThreshold: sensor.maxThreshold,
                        },
                    });
                }
                catch (alertError) {
                    const msg = alertError instanceof Error
                        ? alertError.message
                        : String(alertError);
                    this.logger.error(`Failed to create threshold alert for sensor ${sensorId}: ${msg}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to process sensor data for ${sensorId}`, error);
        }
    }
    async getSensorData(sensorId, limit = 100) {
        return this.sensorDataRepository.find({
            where: { sensor: { id: sensorId } },
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
    async getSensorStatus(sensorId) {
        return this.sensorRepository.findOne({
            where: { id: sensorId },
        });
    }
    async getActiveStationSensors(stationId) {
        return this.sensorRepository.find({
            where: {
                station: { id: stationId },
                status: Sensor_entity_1.SensorStatus.ACTIVE,
            },
        });
    }
};
exports.IotService = IotService;
exports.IotService = IotService = IotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Sensor_entity_1.Sensor)),
    __param(1, (0, typeorm_1.InjectRepository)(SensorData_entity_1.SensorData)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        realtime_service_1.RealtimeService,
        alerts_service_1.AlertsService])
], IotService);
//# sourceMappingURL=iot.service.js.map
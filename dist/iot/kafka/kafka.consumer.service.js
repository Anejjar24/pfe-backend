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
var KafkaConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumerService = exports.TOPIC_SENSOR_ANOMALIES = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafkajs_1 = require("kafkajs");
const alerts_service_1 = require("../../alerts/alerts.service");
const Alert_entity_1 = require("../../database/entities/Alert.entity");
const kafka_producer_service_1 = require("./kafka.producer.service");
exports.TOPIC_SENSOR_ANOMALIES = 'sensors.anomalies';
const CONSUMER_GROUP_ID = 'aquaflow-pipeline';
let KafkaConsumerService = KafkaConsumerService_1 = class KafkaConsumerService {
    constructor(configService, alertsService) {
        this.configService = configService;
        this.alertsService = alertsService;
        this.logger = new common_1.Logger(KafkaConsumerService_1.name);
        this.consumer = null;
        this.running = false;
        this.stats = {
            readingsConsumed: 0,
            anomaliesConsumed: 0,
            lastReadingAt: null,
            lastAnomalyAt: null,
            consumerGroupId: CONSUMER_GROUP_ID,
        };
        this.readingHandlers = [];
    }
    async onModuleInit() {
        const brokers = this.configService.get('KAFKA_BROKERS');
        if (!brokers) {
            this.logger.warn('KAFKA_BROKERS not set — Kafka consumer disabled');
            return;
        }
        const kafka = new kafkajs_1.Kafka({
            clientId: 'aquaflow-consumer',
            brokers: brokers.split(',').map((b) => b.trim()),
            retry: { initialRetryTime: 300, retries: 8 },
        });
        this.consumer = kafka.consumer({
            groupId: CONSUMER_GROUP_ID,
            sessionTimeout: 30_000,
            heartbeatInterval: 3_000,
        });
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({
                topics: [kafka_producer_service_1.TOPIC_SENSOR_READINGS, exports.TOPIC_SENSOR_ANOMALIES],
                fromBeginning: false,
            });
            this.running = true;
            this.logger.log(`Kafka consumer [${CONSUMER_GROUP_ID}] subscribed → ` +
                `[${kafka_producer_service_1.TOPIC_SENSOR_READINGS}, ${exports.TOPIC_SENSOR_ANOMALIES}]`);
            this.consumer
                .run({ eachMessage: (payload) => this.handleMessage(payload) })
                .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Kafka consumer run error: ${msg}`);
                this.running = false;
            });
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Kafka consumer failed to start (${msg}) — running without consumer`);
            this.consumer = null;
        }
    }
    async onModuleDestroy() {
        if (this.consumer && this.running) {
            await this.consumer.disconnect();
            this.logger.log('Kafka consumer disconnected');
        }
    }
    registerReadingHandler(handler) {
        this.readingHandlers.push(handler);
        this.logger.log(`Pipeline handler registered (total: ${this.readingHandlers.length})`);
    }
    getPipelineStats() {
        return { ...this.stats };
    }
    getIsRunning() {
        return this.running;
    }
    async handleMessage({ topic, partition, message, }) {
        if (!message.value)
            return;
        try {
            const payload = JSON.parse(message.value.toString());
            this.logger.debug(`[${topic}] partition=${partition} offset=${message.offset}`);
            if (topic === kafka_producer_service_1.TOPIC_SENSOR_READINGS) {
                await this.onSensorReading(payload);
            }
            else if (topic === exports.TOPIC_SENSOR_ANOMALIES) {
                await this.onSensorAnomaly(payload);
            }
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to handle Kafka message on ${topic}: ${msg}`);
        }
    }
    async onSensorReading(msg) {
        this.stats.readingsConsumed += 1;
        this.stats.lastReadingAt = new Date().toISOString();
        for (const handler of this.readingHandlers) {
            try {
                await handler(msg);
            }
            catch (err) {
                const errMsg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Reading pipeline handler error: ${errMsg}`);
            }
        }
    }
    async onSensorAnomaly(msg) {
        this.stats.anomaliesConsumed += 1;
        this.stats.lastAnomalyAt = new Date().toISOString();
        const severity = msg.zScore >= 4 ? Alert_entity_1.AlertSeverity.CRITICAL
            : msg.zScore >= 3 ? Alert_entity_1.AlertSeverity.ERROR
                : Alert_entity_1.AlertSeverity.WARNING;
        try {
            await this.alertsService.create({
                type: Alert_entity_1.AlertType.ANOMALY,
                severity,
                message: `Anomaly detected on sensor ${msg.sensorId}: value=${msg.value} ${msg.unit} (z-score=${msg.zScore.toFixed(2)})`,
                description: `Spark Streaming detected a statistical anomaly. ` +
                    `Rolling mean: ${msg.rollingMean.toFixed(2)}, stddev: ${msg.rollingStddev.toFixed(2)}, ` +
                    `window: ${msg.windowMinutes} min.`,
                stationId: msg.stationId,
                sensorId: msg.sensorId,
                sourceSystem: 'spark-streaming',
                data: {
                    value: msg.value,
                    zScore: msg.zScore,
                    rollingMean: msg.rollingMean,
                    rollingStddev: msg.rollingStddev,
                    windowMinutes: msg.windowMinutes,
                    timestamp: msg.timestamp,
                },
            });
            this.logger.warn(`Anomaly alert created for sensor ${msg.sensorId} ` +
                `[severity=${severity}, z=${msg.zScore.toFixed(2)}]`);
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Failed to create anomaly alert: ${errMsg}`);
        }
    }
};
exports.KafkaConsumerService = KafkaConsumerService;
exports.KafkaConsumerService = KafkaConsumerService = KafkaConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        alerts_service_1.AlertsService])
], KafkaConsumerService);
//# sourceMappingURL=kafka.consumer.service.js.map
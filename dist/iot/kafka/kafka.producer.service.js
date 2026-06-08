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
var KafkaProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerService = exports.TOPIC_SENSOR_READINGS = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafkajs_1 = require("kafkajs");
exports.TOPIC_SENSOR_READINGS = 'sensors.readings';
let KafkaProducerService = KafkaProducerService_1 = class KafkaProducerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(KafkaProducerService_1.name);
        this.producer = null;
        this.connected = false;
    }
    async onModuleInit() {
        const brokers = this.configService.get('KAFKA_BROKERS');
        if (!brokers) {
            this.logger.warn('KAFKA_BROKERS not set — Kafka producer disabled');
            return;
        }
        const kafka = new kafkajs_1.Kafka({
            clientId: 'aquaflow-backend',
            brokers: brokers.split(',').map((b) => b.trim()),
            retry: {
                initialRetryTime: 300,
                retries: 5,
            },
        });
        this.producer = kafka.producer({
            allowAutoTopicCreation: true,
        });
        try {
            await this.producer.connect();
            this.connected = true;
            this.logger.log(`Kafka producer connected → ${brokers}`);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Kafka producer failed to connect (${msg}) — running without Kafka`);
            this.producer = null;
        }
    }
    async onModuleDestroy() {
        if (this.producer && this.connected) {
            await this.producer.disconnect();
            this.logger.log('Kafka producer disconnected');
        }
    }
    async publishSensorReading(message) {
        if (!this.producer || !this.connected)
            return;
        try {
            const records = await this.producer.send({
                topic: exports.TOPIC_SENSOR_READINGS,
                messages: [
                    {
                        key: message.sensorId,
                        value: JSON.stringify(message),
                        timestamp: String(Date.now()),
                    },
                ],
            });
            this.logger.debug(`Published sensor reading → ${exports.TOPIC_SENSOR_READINGS} ` +
                `[partition=${records[0]?.partition}, offset=${records[0]?.offset}]`);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to publish sensor reading to Kafka: ${msg}`);
        }
    }
};
exports.KafkaProducerService = KafkaProducerService;
exports.KafkaProducerService = KafkaProducerService = KafkaProducerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KafkaProducerService);
//# sourceMappingURL=kafka.producer.service.js.map
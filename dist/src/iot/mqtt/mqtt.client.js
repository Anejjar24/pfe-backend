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
var MqttClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mqtt = require("mqtt");
const iot_service_1 = require("../iot.service");
let MqttClient = MqttClient_1 = class MqttClient {
    constructor(configService, iotService) {
        this.configService = configService;
        this.iotService = iotService;
        this.logger = new common_1.Logger(MqttClient_1.name);
        this.isConnected = false;
        this.externalHandlers = [];
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        const brokerUrl = this.configService.get('MQTT_BROKER_URL') || 'mqtt://localhost:1883';
        const username = this.configService.get('MQTT_USERNAME');
        const password = this.configService.get('MQTT_PASSWORD');
        const options = {
            reconnectPeriod: 5000,
            clientId: `aquaflow-${Date.now()}`,
        };
        if (username && password) {
            options.username = username;
            options.password = password;
        }
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(brokerUrl, options);
            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log(`Connected to MQTT broker: ${brokerUrl}`);
                this.subscribeToTopics();
                resolve();
            });
            this.client.on('error', (error) => {
                this.logger.error(`MQTT connection error: ${error.message}`);
                reject(error);
            });
            this.client.on('message', (topic, payload) => {
                this.handleMessage(topic, payload);
            });
            this.client.on('disconnect', () => {
                this.isConnected = false;
                this.logger.warn('Disconnected from MQTT broker');
            });
        });
    }
    async disconnect() {
        return new Promise((resolve) => {
            if (this.client && this.isConnected) {
                this.client.end(() => {
                    this.isConnected = false;
                    this.logger.log('Disconnected from MQTT broker');
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    subscribeToTopics() {
        const topics = [
            'sensors/+/data',
            'sensors/+/status',
            'devices/+/heartbeat',
        ];
        topics.forEach((topic) => {
            this.client?.subscribe(topic, (err) => {
                if (err) {
                    this.logger.error(`Failed to subscribe to ${topic}: ${err}`);
                }
                else {
                    this.logger.debug(`Subscribed to topic: ${topic}`);
                }
            });
        });
    }
    registerHandler(handler) {
        this.externalHandlers.push(handler);
    }
    handleMessage(topic, payload) {
        try {
            const message = JSON.parse(payload.toString());
            this.logger.debug(`MQTT message received on ${topic}`);
            if (topic.startsWith('sensors/') && topic.endsWith('/data')) {
                const [, sensorId] = topic.split('/');
                const rawValue = message?.value;
                const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
                if (!sensorId || Number.isNaN(value)) {
                    this.logger.warn(`Invalid sensor payload on ${topic}: ${payload.toString()}`);
                    return;
                }
                this.iotService.processSensorData(sensorId, value).catch((error) => {
                    const message = error instanceof Error ? error.message : String(error);
                    this.logger.error(`Failed to process sensor data for ${sensorId}: ${message}`);
                });
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to parse MQTT message: ${message}`);
        }
        for (const handler of this.externalHandlers) {
            try {
                handler(topic, payload);
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.error(`External MQTT handler error: ${msg}`);
            }
        }
    }
    publish(topic, message) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('MQTT client not connected'));
                return;
            }
            const payload = JSON.stringify(message);
            this.client?.publish(topic, payload, { qos: 1 }, (err) => {
                if (err) {
                    this.logger.error(`Failed to publish to ${topic}: ${err}`);
                    reject(err);
                }
                else {
                    this.logger.debug(`Published to ${topic}`);
                    resolve();
                }
            });
        });
    }
    subscribe(topic, callback) {
        this.client?.subscribe(topic, (err) => {
            if (err) {
                this.logger.error(`Failed to subscribe to ${topic}: ${err}`);
            }
            else {
                this.logger.debug(`Subscribed to topic: ${topic}`);
            }
        });
    }
    getIsConnected() {
        return this.isConnected;
    }
};
exports.MqttClient = MqttClient;
exports.MqttClient = MqttClient = MqttClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        iot_service_1.IotService])
], MqttClient);
//# sourceMappingURL=mqtt.client.js.map
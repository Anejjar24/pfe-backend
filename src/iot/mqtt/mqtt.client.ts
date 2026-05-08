import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { MqttClient as MqttClientType } from 'mqtt';

@Injectable()
export class MqttClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttClient.name);
  private client: MqttClientType;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    const brokerUrl =
      this.configService.get('MQTT_BROKER_URL') || 'mqtt://localhost:1883';
    const username = this.configService.get('MQTT_USERNAME');
    const password = this.configService.get('MQTT_PASSWORD');

    const options: any = {
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

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client && this.isConnected) {
        this.client.end(() => {
          this.isConnected = false;
          this.logger.log('Disconnected from MQTT broker');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private subscribeToTopics(): void {
    const topics = [
      'sensors/+/data',
      'sensors/+/status',
      'devices/+/heartbeat',
    ];

    topics.forEach((topic) => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${topic}: ${err}`);
        } else {
          this.logger.debug(`Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const message = JSON.parse(payload.toString());
      this.logger.debug(`MQTT message received on ${topic}`);
      // Message handling will be delegated to IotService
    } catch (error) {
      this.logger.error(`Failed to parse MQTT message: ${error.message}`);
    }
  }

  publish(topic: string, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      const payload = JSON.stringify(message);
      this.client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`Failed to publish to ${topic}: ${err}`);
          reject(err);
        } else {
          this.logger.debug(`Published to ${topic}`);
          resolve();
        }
      });
    });
  }

  subscribe(topic: string, callback: (topic: string, payload: Buffer) => void): void {
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error(`Failed to subscribe to ${topic}: ${err}`);
      } else {
        this.logger.debug(`Subscribed to topic: ${topic}`);
      }
    });
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

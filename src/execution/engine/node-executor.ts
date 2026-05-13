import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsService } from '../../alerts/alerts.service';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
import { MqttClient } from '../../iot/mqtt/mqtt.client';
import { StationsService } from '../../stations/stations.service';
import { AlertTriggerHandler } from '../handlers/alert-trigger.handler';
import { ActionHandler } from '../handlers/action.handler';
import { DecisionHandler } from '../handlers/decision.handler';
import { HttpRequestHandler } from '../handlers/http-request.handler';
import { InputHandler } from '../handlers/input.handler';
import { MqttPublishHandler } from '../handlers/mqtt-publish.handler';
import { OutputHandler } from '../handlers/output.handler';
import { PumpControlHandler } from '../handlers/pump-control.handler';
import { SensorReadHandler } from '../handlers/sensor-read.handler';
import { StationControlHandler } from '../handlers/station-control.handler';
import { ThresholdCheckHandler } from '../handlers/threshold-check.handler';
import { ExecutionContext } from './execution-context';

@Injectable()
export class NodeExecutor {
  // Generic handlers (no external deps)
  private readonly inputHandler = new InputHandler();
  private readonly actionHandler = new ActionHandler();
  private readonly decisionHandler = new DecisionHandler();
  private readonly outputHandler = new OutputHandler();
  private readonly thresholdCheckHandler = new ThresholdCheckHandler();
  private readonly httpRequestHandler = new HttpRequestHandler();

  // Industrial handlers (injected deps)
  private readonly sensorReadHandler: SensorReadHandler;
  private readonly alertTriggerHandler: AlertTriggerHandler;
  private readonly mqttPublishHandler: MqttPublishHandler;
  private readonly pumpControlHandler: PumpControlHandler;
  private readonly stationControlHandler: StationControlHandler;

  constructor(
    @InjectRepository(Sensor) sensorRepository: Repository<Sensor>,
    alertsService: AlertsService,
    mqttClient: MqttClient,
    stationsService: StationsService,
  ) {
    this.sensorReadHandler = new SensorReadHandler(sensorRepository);
    this.alertTriggerHandler = new AlertTriggerHandler(alertsService);
    this.mqttPublishHandler = new MqttPublishHandler(mqttClient);
    this.pumpControlHandler = new PumpControlHandler(mqttClient);
    this.stationControlHandler = new StationControlHandler(stationsService);
  }

  async execute(node: WorkflowNode, input: unknown, context: ExecutionContext) {
    switch (node.type) {
      // Generic blocks
      case 'input':       return this.inputHandler.execute(node, context);
      case 'action':      return this.actionHandler.execute(node, input);
      case 'decision':    return this.decisionHandler.execute(node, input);
      case 'output':      return this.outputHandler.execute(node, input);
      case 'delay':       return this.handleDelay(node, input);
      case 'api':         return { request: node.data, input, mocked: true };
      case 'notification': return { notified: true, channel: node.data?.channel, input };

      // Industrial blocks
      case 'sensor-read':      return this.sensorReadHandler.execute(node);
      case 'threshold-check':  return this.thresholdCheckHandler.execute(node, input);
      case 'alert-trigger':    return this.alertTriggerHandler.execute(node, input);
      case 'mqtt-publish':     return this.mqttPublishHandler.execute(node, input);
      case 'pump-control':     return this.pumpControlHandler.execute(node, input);
      case 'station-control':  return this.stationControlHandler.execute(node, input);

      // Integration blocks
      case 'http-request':     return this.httpRequestHandler.execute(node, input);

      default: return input;
    }
  }

  private async handleDelay(node: WorkflowNode, input: unknown): Promise<unknown> {
    const ms = Math.min(Number(node.data?.durationMs ?? 500), 30_000);
    await new Promise((resolve) => setTimeout(resolve, ms));
    return input;
  }
}

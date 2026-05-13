import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsModule } from '../alerts/alerts.module';
import { Sensor } from '../database/entities/Sensor.entity';
import { Workflow } from '../database/entities/Workflow.entity';
import { IotModule } from '../iot/iot.module';
import { StationsModule } from '../stations/stations.module';
import { NodeExecutor } from '../execution/engine/node-executor';
import { WorkflowRunner } from '../execution/engine/workflow-runner';
import { FlowExecutorService } from './flow-executor.service';
import { FlowValidatorService } from './flow-validator.service';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, Sensor]),
    AlertsModule,
    IotModule,
    StationsModule,
  ],
  controllers: [FlowsController],
  providers: [
    FlowExecutorService,
    FlowValidatorService,
    FlowsService,
    NodeExecutor,
    WorkflowRunner,
  ],
})
export class FlowsModule {}

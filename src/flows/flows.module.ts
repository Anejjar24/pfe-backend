import { Module } from '@nestjs/common';
import { NodeExecutor } from '../execution/engine/node-executor';
import { WorkflowRunner } from '../execution/engine/workflow-runner';
import { FlowExecutorService } from './flow-executor.service';
import { FlowValidatorService } from './flow-validator.service';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';

@Module({
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

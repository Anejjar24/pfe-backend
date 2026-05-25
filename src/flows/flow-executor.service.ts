import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionResult, WorkflowGraph } from '../common/types/workflow.types';
import {
  WorkflowExecution,
  WorkflowExecutionStatus,
} from '../database/entities/WorkflowExecution.entity';
import { Workflow } from '../database/entities/Workflow.entity';
import { User } from '../database/entities/User.entity';
import { WorkflowRunner } from '../execution/engine/workflow-runner';
import { FlowValidatorService } from './flow-validator.service';

export interface ExecuteOptions {
  workflowId?: string;
  user?: User;
  triggerSource?: string;
}

@Injectable()
export class FlowExecutorService {
  private readonly logger = new Logger(FlowExecutorService.name);

  constructor(
    private readonly validator: FlowValidatorService,
    private readonly runner: WorkflowRunner,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepo: Repository<WorkflowExecution>,
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
  ) {}

  async execute(
    graph: WorkflowGraph,
    input: Record<string, unknown> = {},
    options: ExecuteOptions = {},
  ): Promise<ExecutionResult> {
    this.validator.validate(graph);

    const workflow = options.workflowId
      ? await this.workflowRepo.findOne({ where: { id: options.workflowId } })
      : null;

    const execution = await this.executionRepo.save(
      this.executionRepo.create({
        workflow: workflow ?? undefined,
        status: WorkflowExecutionStatus.RUNNING,
        input,
        triggerSource: options.triggerSource ?? 'manual',
        triggeredBy: options.user ?? undefined,
        nodeExecutionCount: 0,
        successCount: 0,
        failureCount: 0,
      }),
    );

    const startedAt = Date.now();
    let result: ExecutionResult;

    try {
      result = await this.runner.run(graph, input);

      const duration = Date.now() - startedAt;
      await this.executionRepo.save({
        ...execution,
        status: WorkflowExecutionStatus.COMPLETED,
        output: result.output as Record<string, unknown>,
        executionLog: result.steps as unknown as Record<string, unknown>[],
        nodeExecutionCount: result.steps.length,
        successCount: result.steps.length,
        failureCount: 0,
        duration,
      });

      if (workflow) {
        await this.workflowRepo.update(workflow.id, {
          executionCount: () => 'execution_count + 1',
          lastExecutedAt: new Date(),
        });
      }
    } catch (err) {
      const duration = Date.now() - startedAt;
      const errorMessage = err instanceof Error ? err.message : String(err);
      const stackTrace = err instanceof Error ? err.stack : undefined;

      await this.executionRepo.save({
        ...execution,
        status: WorkflowExecutionStatus.FAILED,
        errorMessage,
        stackTrace,
        failureCount: 1,
        duration,
      });

      this.logger.error(`Workflow execution failed: ${errorMessage}`, stackTrace);
      throw err;
    }

    return result;
  }
}

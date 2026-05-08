import { Injectable } from '@nestjs/common';
import { ExecutionResult, WorkflowGraph } from '../common/types/workflow.types';
import { WorkflowRunner } from '../execution/engine/workflow-runner';
import { FlowValidatorService } from './flow-validator.service';

@Injectable()
export class FlowExecutorService {
  constructor(
    private readonly validator: FlowValidatorService,
    private readonly runner: WorkflowRunner,
  ) {}

  async execute(graph: WorkflowGraph, input: Record<string, unknown> = {}): Promise<ExecutionResult> {
    this.validator.validate(graph);
    return this.runner.run(graph, input);
  }
}

import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../../common/types/workflow.types';
import { ActionHandler } from '../handlers/action.handler';
import { DecisionHandler } from '../handlers/decision.handler';
import { InputHandler } from '../handlers/input.handler';
import { OutputHandler } from '../handlers/output.handler';
import { ExecutionContext } from './execution-context';

@Injectable()
export class NodeExecutor {
  private readonly inputHandler = new InputHandler();
  private readonly actionHandler = new ActionHandler();
  private readonly decisionHandler = new DecisionHandler();
  private readonly outputHandler = new OutputHandler();

  async execute(node: WorkflowNode, input: unknown, context: ExecutionContext) {
    if (node.type === 'input') return this.inputHandler.execute(node, context);
    if (node.type === 'action') return this.actionHandler.execute(node, input);
    if (node.type === 'decision') return this.decisionHandler.execute(node, input);
    if (node.type === 'output') return this.outputHandler.execute(node, input);
    if (node.type === 'delay') return input;
    if (node.type === 'api') return { request: node.data, input, mocked: true };
    if (node.type === 'notification') return { notified: true, channel: node.data?.channel, input };
    return input;
  }
}

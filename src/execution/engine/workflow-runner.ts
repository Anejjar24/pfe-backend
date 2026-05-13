import { Injectable } from '@nestjs/common';
import { ExecutionResult, WorkflowEdge, WorkflowGraph, WorkflowNode } from '../../common/types/workflow.types';
import { ExecutionContext } from './execution-context';
import { NodeExecutor } from './node-executor';

@Injectable()
export class WorkflowRunner {
  constructor(private readonly nodeExecutor: NodeExecutor) {}

  async run(graph: WorkflowGraph, input: Record<string, unknown> = {}): Promise<ExecutionResult> {
    const context = new ExecutionContext(input);
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
    const outgoing = this.groupEdges(graph.edges, 'source');
    const incoming = this.groupEdges(graph.edges, 'target');
    const starts = graph.nodes.filter((node) => node.type === 'input' || !incoming.get(node.id)?.length);
    const queue = [...starts];
    const visited = new Set<string>();
    let finalOutput: unknown = null;

    while (queue.length) {
      const node = queue.shift() as WorkflowNode;
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      const previousEdges = incoming.get(node.id) || [];
      const previousInput = previousEdges.length
        ? context.getValue(previousEdges[0].source)
        : input;

      const output = await this.nodeExecutor.execute(node, previousInput, context);
      context.setValue(node.id, output);
      context.addStep({ nodeId: node.id, type: node.type, input: previousInput, output });

      if (node.type === 'output') finalOutput = output;

      const nextEdges = this.filterDecisionEdges(node, output, outgoing.get(node.id) || []);
      nextEdges.forEach((edge) => {
        const target = nodes.get(edge.target);
        if (target) queue.push(target);
      });
    }

    return {
      workflowId: graph.id,
      status: 'success',
      output: finalOutput,
      steps: context.steps,
    };
  }

  private groupEdges(edges: WorkflowEdge[], key: 'source' | 'target') {
    return edges.reduce((groups, edge) => {
      const id = edge[key];
      groups.set(id, [...(groups.get(id) || []), edge]);
      return groups;
    }, new Map<string, WorkflowEdge[]>());
  }

  private filterDecisionEdges(node: WorkflowNode, output: unknown, edges: WorkflowEdge[]) {
    // Any handler can return a { branch } field to drive port-based routing
    if (typeof output !== 'object' || output === null || !('branch' in output)) {
      return edges;
    }

    const branch = String((output as { branch: string }).branch);
    return edges.filter((edge) => !edge.sourcePort || edge.sourcePort === branch);
  }
}

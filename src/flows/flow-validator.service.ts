import { BadRequestException, Injectable } from '@nestjs/common';
import { WorkflowGraph } from '../common/types/workflow.types';

const validTypes = new Set([
  // Generic blocks
  'input', 'output', 'action', 'decision', 'delay', 'api', 'notification',
  // Industrial blocks
  'sensor-read', 'threshold-check', 'alert-trigger',
  'mqtt-publish', 'pump-control', 'station-control',
  // Integration blocks
  'http-request',
]);

@Injectable()
export class FlowValidatorService {
  validate(graph: WorkflowGraph) {
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new BadRequestException('Workflow graph must contain nodes and edges arrays.');
    }

    const nodeIds = new Set<string>();
    graph.nodes.forEach((node) => {
      if (!node.id || !validTypes.has(node.type)) {
        throw new BadRequestException(`Invalid node "${node.id || 'unknown'}".`);
      }
      if (nodeIds.has(node.id)) {
        throw new BadRequestException(`Duplicate node id "${node.id}".`);
      }
      nodeIds.add(node.id);
    });

    graph.edges.forEach((edge) => {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        throw new BadRequestException(`Invalid edge from "${edge.source}" to "${edge.target}".`);
      }
      if (edge.source === edge.target) {
        throw new BadRequestException('Self-referencing edges are not allowed.');
      }
    });

    return true;
  }
}

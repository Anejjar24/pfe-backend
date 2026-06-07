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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRunner = void 0;
const common_1 = require("@nestjs/common");
const realtime_service_1 = require("../../realtime/realtime.service");
const execution_context_1 = require("./execution-context");
const node_executor_1 = require("./node-executor");
let WorkflowRunner = class WorkflowRunner {
    constructor(nodeExecutor, realtimeService) {
        this.nodeExecutor = nodeExecutor;
        this.realtimeService = realtimeService;
    }
    async run(graph, input = {}, userId) {
        const context = new execution_context_1.ExecutionContext(input);
        const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
        const outgoing = this.groupEdges(graph.edges, 'source');
        const incoming = this.groupEdges(graph.edges, 'target');
        const starts = graph.nodes.filter((node) => node.type === 'input' || !incoming.get(node.id)?.length);
        const queue = [...starts];
        const visited = new Set();
        let finalOutput = null;
        if (userId) {
            this.realtimeService.broadcastToUser(userId, 'workflow:started', {
                workflowId: graph.id,
                nodeCount: graph.nodes.length,
            });
        }
        try {
            while (queue.length) {
                const node = queue.shift();
                if (visited.has(node.id))
                    continue;
                visited.add(node.id);
                const previousEdges = incoming.get(node.id) || [];
                const previousInput = previousEdges.length
                    ? this.unwrapBranchValue(context.getValue(previousEdges[0].source))
                    : input;
                if (userId) {
                    this.realtimeService.broadcastToUser(userId, 'workflow:node-executing', {
                        workflowId: graph.id,
                        nodeId: node.id,
                        type: node.type,
                    });
                }
                let output;
                try {
                    output = await this.nodeExecutor.execute(node, previousInput, context);
                }
                catch (nodeErr) {
                    if (userId) {
                        this.realtimeService.broadcastToUser(userId, 'workflow:node-executed', {
                            workflowId: graph.id,
                            nodeId: node.id,
                            type: node.type,
                            status: 'error',
                            error: nodeErr instanceof Error ? nodeErr.message : String(nodeErr),
                        });
                    }
                    throw nodeErr;
                }
                context.setValue(node.id, output);
                context.addStep({ nodeId: node.id, type: node.type, input: previousInput, output });
                if (userId) {
                    this.realtimeService.broadcastToUser(userId, 'workflow:node-executed', {
                        workflowId: graph.id,
                        nodeId: node.id,
                        type: node.type,
                        status: 'success',
                    });
                }
                if (node.type === 'output')
                    finalOutput = output;
                const nextEdges = this.filterDecisionEdges(node, output, outgoing.get(node.id) || []);
                nextEdges.forEach((edge) => {
                    const target = nodes.get(edge.target);
                    if (target)
                        queue.push(target);
                });
            }
        }
        catch (err) {
            if (userId) {
                this.realtimeService.broadcastToUser(userId, 'workflow:failed', {
                    workflowId: graph.id,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
            throw err;
        }
        if (userId) {
            this.realtimeService.broadcastToUser(userId, 'workflow:completed', {
                workflowId: graph.id,
                status: 'success',
                stepCount: context.steps.length,
            });
        }
        return {
            workflowId: graph.id,
            status: 'success',
            output: finalOutput,
            steps: context.steps,
        };
    }
    groupEdges(edges, key) {
        return edges.reduce((groups, edge) => {
            const id = edge[key];
            groups.set(id, [...(groups.get(id) || []), edge]);
            return groups;
        }, new Map());
    }
    unwrapBranchValue(output) {
        if (typeof output === 'object' &&
            output !== null &&
            'branch' in output &&
            'value' in output) {
            return output['value'];
        }
        return output;
    }
    filterDecisionEdges(node, output, edges) {
        if (typeof output !== 'object' || output === null || !('branch' in output)) {
            return edges;
        }
        const branch = String(output.branch);
        return edges.filter((edge) => !edge.sourcePort || edge.sourcePort === branch);
    }
};
exports.WorkflowRunner = WorkflowRunner;
exports.WorkflowRunner = WorkflowRunner = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [node_executor_1.NodeExecutor,
        realtime_service_1.RealtimeService])
], WorkflowRunner);
//# sourceMappingURL=workflow-runner.js.map
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
const execution_context_1 = require("./execution-context");
const node_executor_1 = require("./node-executor");
let WorkflowRunner = class WorkflowRunner {
    constructor(nodeExecutor) {
        this.nodeExecutor = nodeExecutor;
    }
    async run(graph, input = {}) {
        const context = new execution_context_1.ExecutionContext(input);
        const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
        const outgoing = this.groupEdges(graph.edges, 'source');
        const incoming = this.groupEdges(graph.edges, 'target');
        const starts = graph.nodes.filter((node) => node.type === 'input' || !incoming.get(node.id)?.length);
        const queue = [...starts];
        const visited = new Set();
        let finalOutput = null;
        while (queue.length) {
            const node = queue.shift();
            if (visited.has(node.id))
                continue;
            visited.add(node.id);
            const previousEdges = incoming.get(node.id) || [];
            const previousInput = previousEdges.length
                ? context.getValue(previousEdges[0].source)
                : input;
            const output = await this.nodeExecutor.execute(node, previousInput, context);
            context.setValue(node.id, output);
            context.addStep({ nodeId: node.id, type: node.type, input: previousInput, output });
            if (node.type === 'output')
                finalOutput = output;
            const nextEdges = this.filterDecisionEdges(node, output, outgoing.get(node.id) || []);
            nextEdges.forEach((edge) => {
                const target = nodes.get(edge.target);
                if (target)
                    queue.push(target);
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
    __metadata("design:paramtypes", [node_executor_1.NodeExecutor])
], WorkflowRunner);
//# sourceMappingURL=workflow-runner.js.map
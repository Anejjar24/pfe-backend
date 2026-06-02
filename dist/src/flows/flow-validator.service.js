"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowValidatorService = void 0;
const common_1 = require("@nestjs/common");
const validTypes = new Set([
    'input', 'output', 'action', 'decision', 'delay', 'notification',
    'api',
    'data-transform',
    'sensor-read', 'threshold-check', 'alert-trigger',
    'mqtt-publish', 'pump-control', 'station-control',
    'http-request',
]);
let FlowValidatorService = class FlowValidatorService {
    validate(graph) {
        if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
            throw new common_1.BadRequestException('Workflow graph must contain nodes and edges arrays.');
        }
        const nodeIds = new Set();
        graph.nodes.forEach((node) => {
            if (!node.id || !validTypes.has(node.type)) {
                throw new common_1.BadRequestException(`Invalid node "${node.id || 'unknown'}".`);
            }
            if (nodeIds.has(node.id)) {
                throw new common_1.BadRequestException(`Duplicate node id "${node.id}".`);
            }
            nodeIds.add(node.id);
        });
        const adjacency = new Map();
        for (const id of nodeIds)
            adjacency.set(id, []);
        const occupiedPorts = new Set();
        graph.edges.forEach((edge) => {
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
                throw new common_1.BadRequestException(`Invalid edge from "${edge.source}" to "${edge.target}": one or both nodes do not exist.`);
            }
            if (edge.source === edge.target) {
                throw new common_1.BadRequestException(`Self-referencing edge on node "${edge.source}" is not allowed.`);
            }
            if (edge.targetPort) {
                const portKey = `${edge.target}:${edge.targetPort}`;
                if (occupiedPorts.has(portKey)) {
                    throw new common_1.BadRequestException(`Port "${edge.targetPort}" on node "${edge.target}" already has an incoming connection. ` +
                        'Each input port may have at most one incoming edge.');
                }
                occupiedPorts.add(portKey);
            }
            adjacency.get(edge.source).push(edge.target);
        });
        const cycle = this.detectCycles(nodeIds, adjacency);
        if (cycle) {
            throw new common_1.BadRequestException(`Workflow contains a cycle: ${cycle.join(' → ')}. ` +
                'Cyclic graphs cannot be executed — remove the back edge to fix this.');
        }
        return true;
    }
    detectCycles(nodeIds, adjacency) {
        const WHITE = 0;
        const GREY = 1;
        const BLACK = 2;
        const color = new Map();
        for (const id of nodeIds)
            color.set(id, WHITE);
        const stack = [];
        const dfs = (id) => {
            color.set(id, GREY);
            stack.push(id);
            for (const neighbour of (adjacency.get(id) ?? [])) {
                const neighbourColor = color.get(neighbour);
                if (neighbourColor === GREY) {
                    const cycleStart = stack.indexOf(neighbour);
                    return [...stack.slice(cycleStart), neighbour];
                }
                if (neighbourColor === WHITE) {
                    const cycle = dfs(neighbour);
                    if (cycle !== null)
                        return cycle;
                }
            }
            stack.pop();
            color.set(id, BLACK);
            return null;
        };
        for (const id of nodeIds) {
            if (color.get(id) === WHITE) {
                const cycle = dfs(id);
                if (cycle !== null)
                    return cycle;
            }
        }
        return null;
    }
};
exports.FlowValidatorService = FlowValidatorService;
exports.FlowValidatorService = FlowValidatorService = __decorate([
    (0, common_1.Injectable)()
], FlowValidatorService);
//# sourceMappingURL=flow-validator.service.js.map
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
    'input', 'output', 'action', 'decision', 'delay', 'api', 'notification',
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
        graph.edges.forEach((edge) => {
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
                throw new common_1.BadRequestException(`Invalid edge from "${edge.source}" to "${edge.target}".`);
            }
            if (edge.source === edge.target) {
                throw new common_1.BadRequestException('Self-referencing edges are not allowed.');
            }
        });
        return true;
    }
};
exports.FlowValidatorService = FlowValidatorService;
exports.FlowValidatorService = FlowValidatorService = __decorate([
    (0, common_1.Injectable)()
], FlowValidatorService);
//# sourceMappingURL=flow-validator.service.js.map
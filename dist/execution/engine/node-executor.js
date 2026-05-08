"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeExecutor = void 0;
const common_1 = require("@nestjs/common");
const action_handler_1 = require("../handlers/action.handler");
const decision_handler_1 = require("../handlers/decision.handler");
const input_handler_1 = require("../handlers/input.handler");
const output_handler_1 = require("../handlers/output.handler");
let NodeExecutor = class NodeExecutor {
    constructor() {
        this.inputHandler = new input_handler_1.InputHandler();
        this.actionHandler = new action_handler_1.ActionHandler();
        this.decisionHandler = new decision_handler_1.DecisionHandler();
        this.outputHandler = new output_handler_1.OutputHandler();
    }
    async execute(node, input, context) {
        if (node.type === 'input')
            return this.inputHandler.execute(node, context);
        if (node.type === 'action')
            return this.actionHandler.execute(node, input);
        if (node.type === 'decision')
            return this.decisionHandler.execute(node, input);
        if (node.type === 'output')
            return this.outputHandler.execute(node, input);
        if (node.type === 'delay')
            return input;
        if (node.type === 'api')
            return { request: node.data, input, mocked: true };
        if (node.type === 'notification')
            return { notified: true, channel: node.data?.channel, input };
        return input;
    }
};
exports.NodeExecutor = NodeExecutor;
exports.NodeExecutor = NodeExecutor = __decorate([
    (0, common_1.Injectable)()
], NodeExecutor);
//# sourceMappingURL=node-executor.js.map
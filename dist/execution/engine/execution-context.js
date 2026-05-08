"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContext = void 0;
class ExecutionContext {
    constructor(input = {}) {
        this.input = input;
        this.values = new Map();
        this.steps = [];
    }
    setValue(nodeId, value) {
        this.values.set(nodeId, value);
    }
    getValue(nodeId) {
        return this.values.get(nodeId);
    }
    addStep(step) {
        this.steps.push(step);
    }
}
exports.ExecutionContext = ExecutionContext;
//# sourceMappingURL=execution-context.js.map
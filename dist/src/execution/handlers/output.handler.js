"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputHandler = void 0;
class OutputHandler {
    execute(node, input) {
        if (node.data?.format === 'number')
            return Number(input);
        if (node.data?.format === 'text')
            return String(input);
        return input;
    }
}
exports.OutputHandler = OutputHandler;
//# sourceMappingURL=output.handler.js.map
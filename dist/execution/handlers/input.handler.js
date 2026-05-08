"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputHandler = void 0;
class InputHandler {
    execute(node, context) {
        return node.data?.value ?? context.input;
    }
}
exports.InputHandler = InputHandler;
//# sourceMappingURL=input.handler.js.map
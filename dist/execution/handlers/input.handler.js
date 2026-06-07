"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputHandler = void 0;
class InputHandler {
    execute(node, context) {
        const raw = node.data?.value ?? context.input;
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw);
            }
            catch {
            }
        }
        return raw;
    }
}
exports.InputHandler = InputHandler;
//# sourceMappingURL=input.handler.js.map
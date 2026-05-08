"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionHandler = void 0;
class ActionHandler {
    execute(node, input) {
        const operation = String(node.data?.operation || 'identity');
        const factor = Number(node.data?.factor ?? 1);
        const numericInput = Number(input);
        if (operation === 'multiply')
            return numericInput * factor;
        if (operation === 'add')
            return numericInput + factor;
        if (operation === 'subtract')
            return numericInput - factor;
        if (operation === 'divide')
            return factor === 0 ? numericInput : numericInput / factor;
        if (operation === 'uppercase')
            return String(input).toUpperCase();
        if (operation === 'append')
            return `${input}${node.data?.text || ''}`;
        return input;
    }
}
exports.ActionHandler = ActionHandler;
//# sourceMappingURL=action.handler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionHandler = void 0;
class DecisionHandler {
    execute(node, input) {
        const current = Number(input);
        const compareTo = Number(node.data?.compareTo ?? 0);
        const operator = String(node.data?.operator || '>');
        const passed = operator === '>' ? current > compareTo :
            operator === '>=' ? current >= compareTo :
                operator === '<' ? current < compareTo :
                    operator === '<=' ? current <= compareTo :
                        operator === '==' ? current === compareTo :
                            operator === '!=' ? current !== compareTo :
                                false;
        return { value: input, branch: passed ? 'true' : 'false', passed };
    }
}
exports.DecisionHandler = DecisionHandler;
//# sourceMappingURL=decision.handler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThresholdCheckHandler = void 0;
class ThresholdCheckHandler {
    execute(node, input) {
        const raw = typeof input === 'object' &&
            input !== null &&
            'value' in input
            ? input.value
            : input;
        const value = Number(raw);
        const min = node.data?.minThreshold != null ? Number(node.data.minThreshold) : null;
        const max = node.data?.maxThreshold != null ? Number(node.data.maxThreshold) : null;
        const mode = String(node.data?.mode || 'between');
        let breach = false;
        if (mode === 'between') {
            if (min !== null && value < min)
                breach = true;
            if (max !== null && value > max)
                breach = true;
        }
        else if (mode === 'above_max') {
            breach = max !== null && value > max;
        }
        else if (mode === 'below_min') {
            breach = min !== null && value < min;
        }
        return {
            value,
            breach,
            pass: !breach,
            min,
            max,
            mode,
            branch: breach ? 'breach' : 'pass',
        };
    }
}
exports.ThresholdCheckHandler = ThresholdCheckHandler;
//# sourceMappingURL=threshold-check.handler.js.map
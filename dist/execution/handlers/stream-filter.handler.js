"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamFilterHandler = void 0;
class StreamFilterHandler {
    execute(node, input) {
        const operation = String(node.data?.operation || 'sample');
        try {
            switch (operation) {
                case 'debounce': return this.debounce(node, input);
                case 'throttle': return this.throttle(node, input);
                case 'sample': return this.sample(node, input);
                case 'burst_detect': return this.burstDetect(node, input);
                default: return { value: input, branch: 'fired' };
            }
        }
        catch (err) {
            return { error: err instanceof Error ? err.message : String(err), branch: 'fired' };
        }
    }
    debounce(node, input) {
        const intervalMs = Number(node.data?.intervalMs ?? 500);
        if (Array.isArray(input) && input.length > 0) {
            return {
                value: input[0],
                suppressed: input.length - 1,
                originalCount: input.length,
                intervalMs,
                branch: 'fired',
            };
        }
        return { value: input, intervalMs, branch: 'fired' };
    }
    throttle(node, input) {
        const intervalMs = Number(node.data?.intervalMs ?? 500);
        const keepEvery = Math.max(1, Math.round(intervalMs / 100));
        if (Array.isArray(input)) {
            const kept = input.filter((_, i) => i % keepEvery === 0);
            return {
                items: kept,
                originalCount: input.length,
                keptCount: kept.length,
                intervalMs,
                branch: 'allowed',
            };
        }
        return { value: input, intervalMs, branch: 'allowed' };
    }
    sample(node, input) {
        const sampleEvery = Math.max(1, Number(node.data?.sampleEvery ?? 5));
        if (Array.isArray(input)) {
            const sampled = input.filter((_, i) => i % sampleEvery === 0);
            return {
                items: sampled,
                originalCount: input.length,
                sampledCount: sampled.length,
                sampleRate: `1 of every ${sampleEvery}`,
                branch: 'fired',
            };
        }
        return { value: input, sampleEvery, branch: 'fired' };
    }
    burstDetect(node, input) {
        const burstCount = Number(node.data?.burstCount ?? 10);
        const burstWindowMs = Number(node.data?.burstWindowMs ?? 1000);
        const items = Array.isArray(input) ? input : [input];
        const count = items.length;
        const isBurst = count >= burstCount;
        return {
            count,
            burstThreshold: burstCount,
            burstWindowMs,
            isBurst,
            items: isBurst ? items : undefined,
            branch: isBurst ? 'burst' : 'normal',
        };
    }
}
exports.StreamFilterHandler = StreamFilterHandler;
//# sourceMappingURL=stream-filter.handler.js.map
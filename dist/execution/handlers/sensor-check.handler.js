"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorCheckHandler = void 0;
class SensorCheckHandler {
    execute(node, input) {
        const operation = String(node.data?.operation || 'multi_threshold');
        try {
            switch (operation) {
                case 'multi_threshold': return this.multiThreshold(node, input);
                case 'rate_of_change': return this.rateOfChange(node, input);
                case 'deadband': return this.deadband(node, input);
                case 'anomaly': return this.anomaly(node, input);
                case 'compare': return this.compare(node, input);
                case 'time_window': return this.timeWindow(node);
                default: return { value: input, branch: 'normal' };
            }
        }
        catch (err) {
            return { error: err instanceof Error ? err.message : String(err), branch: 'normal' };
        }
    }
    multiThreshold(node, input) {
        const value = this.num(input);
        const warning = Number(node.data?.warningThreshold ?? 60);
        const critical = Number(node.data?.criticalThreshold ?? 80);
        const emergency = Number(node.data?.emergencyThreshold ?? 95);
        let branch;
        if (value >= emergency)
            branch = 'emergency';
        else if (value >= critical)
            branch = 'critical';
        else if (value >= warning)
            branch = 'warning';
        else
            branch = 'normal';
        return { value, level: branch, warningThreshold: warning, criticalThreshold: critical, emergencyThreshold: emergency, branch };
    }
    rateOfChange(node, input) {
        const obj = this.obj(input);
        const curr = Number(obj['current'] ?? obj['value'] ?? input);
        const prev = Number(obj['previous'] ?? 0);
        const dtMs = Number(obj['timeDeltaMs'] ?? 1000);
        const change = curr - prev;
        const ratePerSec = dtMs > 0 ? (change / dtMs) * 1000 : change;
        const maxRate = Number(node.data?.maxRatePerSec ?? Infinity);
        const minRate = Number(node.data?.minRatePerSec ?? -Infinity);
        let branch;
        if (ratePerSec > maxRate)
            branch = 'too_fast';
        else if (ratePerSec < minRate)
            branch = 'too_slow';
        else
            branch = 'normal';
        return { current: curr, previous: prev, ratePerSec: Math.round(ratePerSec * 1000) / 1000, branch };
    }
    deadband(node, input) {
        const obj = this.obj(input);
        const current = Number(obj['current'] ?? obj['value'] ?? input);
        const previous = Number(obj['previous'] ?? 0);
        const rawChange = Math.abs(current - previous);
        const width = Number(node.data?.deadbandWidth ?? 2);
        const mode = String(node.data?.deadbandMode || 'absolute');
        const effective = mode === 'percent'
            ? (previous !== 0 ? (rawChange / Math.abs(previous)) * 100 : rawChange)
            : rawChange;
        const changed = effective > width;
        return { current, previous, change: Math.round(effective * 1000) / 1000, deadbandWidth: width, branch: changed ? 'changed' : 'suppressed' };
    }
    anomaly(node, input) {
        const values = this.numericArray(input);
        if (values.length < 3) {
            return { error: 'At least 3 values required for anomaly detection', branch: 'normal' };
        }
        const winSize = Math.min(Number(node.data?.windowSize ?? 20), values.length);
        const window = values.slice(0, winSize);
        const current = window[0];
        const mean = window.reduce((s, v) => s + v, 0) / window.length;
        const variance = window.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / window.length;
        const stddev = Math.sqrt(variance);
        const zscore = stddev > 0 ? Math.abs((current - mean) / stddev) : 0;
        const threshold = Number(node.data?.zscoreThreshold ?? 3);
        return {
            value: current,
            zscore: Math.round(zscore * 1000) / 1000,
            mean: Math.round(mean * 1000) / 1000,
            stddev: Math.round(stddev * 1000) / 1000,
            isAnomaly: zscore > threshold,
            branch: zscore > threshold ? 'anomaly' : 'normal',
        };
    }
    compare(node, input) {
        const obj = this.obj(input);
        const a = Number(obj['valueA'] ?? obj['a'] ?? 0);
        const b = Number(obj['valueB'] ?? obj['b'] ?? 0);
        const tol = Number(node.data?.tolerance ?? 0.01);
        const diff = a - b;
        if (Math.abs(diff) <= tol)
            return { valueA: a, valueB: b, diff, branch: 'equal' };
        if (a > b)
            return { valueA: a, valueB: b, diff, branch: 'a_greater' };
        return { valueA: a, valueB: b, diff, branch: 'b_greater' };
    }
    timeWindow(node) {
        const now = new Date();
        const startStr = String(node.data?.startTime || '08:00');
        const endStr = String(node.data?.endTime || '18:00');
        const daysStr = String(node.data?.daysOfWeek || '1,2,3,4,5');
        const allowedDays = daysStr.split(',').map(d => parseInt(d.trim(), 10));
        const day = now.getDay();
        const [sh, sm] = startStr.split(':').map(Number);
        const [eh, em] = endStr.split(':').map(Number);
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        const dayOk = allowedDays.includes(day);
        const timeOk = nowMin >= startMin && nowMin < endMin;
        return {
            currentTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            currentDay: day,
            dayAllowed: dayOk,
            timeAllowed: timeOk,
            branch: dayOk && timeOk ? 'allowed' : 'blocked',
        };
    }
    num(input) {
        if (typeof input === 'number')
            return input;
        if (typeof input === 'object' && input !== null) {
            const obj = input;
            const v = obj['value'] ?? obj['current'];
            if (v !== undefined)
                return Number(v);
        }
        return Number(input);
    }
    obj(input) {
        return typeof input === 'object' && input !== null
            ? input
            : {};
    }
    numericArray(input) {
        if (Array.isArray(input)) {
            return input.map(Number).filter(v => !isNaN(v));
        }
        if (typeof input === 'object' && input !== null) {
            const obj = input;
            if (Array.isArray(obj['readings'])) {
                return obj['readings'].map(r => Number(r.value)).filter(v => !isNaN(v));
            }
        }
        return typeof input === 'number' ? [input] : [];
    }
}
exports.SensorCheckHandler = SensorCheckHandler;
//# sourceMappingURL=sensor-check.handler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomCalcHandler = void 0;
const mathjs_1 = require("mathjs");
const typeorm_1 = require("typeorm");
const VARIABLE_LETTERS = ['a', 'b', 'c', 'd'];
class CustomCalcHandler {
    constructor(sensorRepo, sensorDataRepo) {
        this.sensorRepo = sensorRepo;
        this.sensorDataRepo = sensorDataRepo;
    }
    async execute(node, _input) {
        try {
            const formula = String(node.data?.formula ?? '').trim();
            if (!formula)
                return { error: 'No formula configured', branch: 'error' };
            const variables = {};
            for (const letter of VARIABLE_LETTERS) {
                const key = `sensor${letter.toUpperCase()}`;
                const sid = String(node.data?.[key] ?? '').trim();
                if (sid)
                    variables[letter] = sid;
            }
            if (Object.keys(variables).length === 0) {
                return { error: 'No sensors configured (set sensorA, sensorB, …)', branch: 'error' };
            }
            const { startDate, endDate } = this.resolveTimeRange(node);
            const seriesMap = {};
            for (const [letter, sensorId] of Object.entries(variables)) {
                const sensor = await this.sensorRepo.findOne({ where: { id: sensorId } });
                if (!sensor) {
                    return { error: `Sensor for variable "${letter}" (id: ${sensorId}) not found`, branch: 'error' };
                }
                const series = await this.fetchSeries(sensorId, startDate, endDate);
                if (series.length === 0) {
                    return { error: `No data found for variable "${letter}" sensor in the selected time range`, branch: 'error' };
                }
                seriesMap[letter] = series;
            }
            const resampleStrategy = String(node.data?.resampleStrategy ?? 'interpolate');
            const downsampleAgg = String(node.data?.downsampleAgg ?? 'mean');
            const aligned = this.alignSeries(seriesMap, resampleStrategy, downsampleAgg);
            if (aligned.length === 0) {
                return { error: 'Time series alignment produced no data points', branch: 'error' };
            }
            const series = this.evaluateFormula(formula, aligned);
            if (series.length === 0) {
                return { error: 'Formula produced no valid numeric results — check variable names and formula syntax', branch: 'error' };
            }
            const aggregation = String(node.data?.aggregation ?? 'mean');
            const result = this.aggregate(series.map(p => p.value), aggregation);
            const rounded = Math.round(result * 10000) / 10000;
            return {
                result: rounded,
                series,
                count: series.length,
                formula,
                aggregation,
                resampleStrategy,
                variables: Object.keys(variables),
                branch: 'result',
            };
        }
        catch (err) {
            return {
                error: err instanceof Error ? err.message : String(err),
                branch: 'error',
            };
        }
    }
    resolveTimeRange(node) {
        const timeMode = String(node.data?.timeMode ?? 'all_data');
        if (timeMode !== 'custom_range')
            return {};
        const startDate = node.data?.startDate ? new Date(String(node.data.startDate)) : undefined;
        const endDate = node.data?.endDate ? new Date(String(node.data.endDate)) : undefined;
        return { startDate, endDate };
    }
    async fetchSeries(sensorId, start, end) {
        let timestampWhere = undefined;
        if (start && end)
            timestampWhere = (0, typeorm_1.Between)(start, end);
        else if (start)
            timestampWhere = (0, typeorm_1.MoreThanOrEqual)(start);
        else if (end)
            timestampWhere = (0, typeorm_1.LessThanOrEqual)(end);
        const where = { sensor: { id: sensorId } };
        if (timestampWhere)
            where.timestamp = timestampWhere;
        const records = await this.sensorDataRepo.find({
            where,
            order: { timestamp: 'ASC' },
            take: 50_000,
            relations: ['sensor'],
        });
        return records.map(r => ({
            timestamp: r.timestamp,
            value: Number(r.value),
        }));
    }
    alignSeries(seriesMap, strategy, downsampleAgg) {
        const letters = Object.keys(seriesMap);
        if (letters.length === 1) {
            const [letter] = letters;
            return seriesMap[letter].map(p => ({
                timestamp: p.timestamp,
                values: { [letter]: p.value },
            }));
        }
        if (strategy === 'downsample') {
            return this.downsampleAlign(seriesMap, downsampleAgg);
        }
        const refLetter = letters.reduce((best, l) => seriesMap[l].length >= seriesMap[best].length ? l : best, letters[0]);
        const refSeries = seriesMap[refLetter];
        return refSeries.map(refPoint => {
            const values = { [refLetter]: refPoint.value };
            for (const letter of letters) {
                if (letter === refLetter)
                    continue;
                values[letter] = strategy === 'forward_fill'
                    ? this.forwardFill(seriesMap[letter], refPoint.timestamp)
                    : this.interpolate(seriesMap[letter], refPoint.timestamp);
            }
            return { timestamp: refPoint.timestamp, values };
        });
    }
    interpolate(series, ts) {
        if (series.length === 0)
            return 0;
        if (series.length === 1)
            return series[0].value;
        const t = ts.getTime();
        if (t <= series[0].timestamp.getTime())
            return series[0].value;
        if (t >= series[series.length - 1].timestamp.getTime())
            return series[series.length - 1].value;
        let lo = 0;
        let hi = series.length - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (series[mid].timestamp.getTime() <= t)
                lo = mid;
            else
                hi = mid;
        }
        const t0 = series[lo].timestamp.getTime();
        const t1 = series[hi].timestamp.getTime();
        if (t1 === t0)
            return series[lo].value;
        const ratio = (t - t0) / (t1 - t0);
        return series[lo].value + ratio * (series[hi].value - series[lo].value);
    }
    forwardFill(series, ts) {
        const t = ts.getTime();
        let last = series[0].value;
        for (const point of series) {
            if (point.timestamp.getTime() <= t)
                last = point.value;
            else
                break;
        }
        return last;
    }
    downsampleAlign(seriesMap, agg) {
        const letters = Object.keys(seriesMap);
        let maxAvgInterval = 0;
        let gridLetter = letters[0];
        for (const letter of letters) {
            const s = seriesMap[letter];
            if (s.length < 2)
                continue;
            const avgInterval = (s[s.length - 1].timestamp.getTime() - s[0].timestamp.getTime()) / (s.length - 1);
            if (avgInterval > maxAvgInterval) {
                maxAvgInterval = avgInterval;
                gridLetter = letter;
            }
        }
        const grid = seriesMap[gridLetter];
        const result = [];
        for (let i = 0; i < grid.length; i++) {
            const bucketStart = grid[i].timestamp.getTime();
            const bucketEnd = i < grid.length - 1
                ? grid[i + 1].timestamp.getTime()
                : bucketStart + maxAvgInterval;
            const values = { [gridLetter]: grid[i].value };
            for (const letter of letters) {
                if (letter === gridLetter)
                    continue;
                const bucket = seriesMap[letter].filter(p => {
                    const t = p.timestamp.getTime();
                    return t >= bucketStart && t < bucketEnd;
                });
                values[letter] = bucket.length > 0
                    ? this.aggValues(bucket.map(p => p.value), agg)
                    : this.forwardFill(seriesMap[letter], grid[i].timestamp);
            }
            result.push({ timestamp: grid[i].timestamp, values });
        }
        return result;
    }
    evaluateFormula(formula, aligned) {
        const results = [];
        for (const point of aligned) {
            try {
                const raw = (0, mathjs_1.evaluate)(formula, { ...point.values });
                const val = typeof raw === 'number' ? raw : Number(raw);
                if (isFinite(val)) {
                    results.push({ timestamp: point.timestamp, value: val });
                }
            }
            catch {
            }
        }
        return results;
    }
    aggValues(values, agg) {
        if (values.length === 0)
            return 0;
        switch (agg) {
            case 'min': return Math.min(...values);
            case 'max': return Math.max(...values);
            case 'sum': return values.reduce((s, v) => s + v, 0);
            default: return values.reduce((s, v) => s + v, 0) / values.length;
        }
    }
    aggregate(values, method) {
        if (values.length === 0)
            return 0;
        switch (method) {
            case 'min': return Math.min(...values);
            case 'max': return Math.max(...values);
            case 'sum': return values.reduce((s, v) => s + v, 0);
            case 'last': return values[values.length - 1];
            default: return values.reduce((s, v) => s + v, 0) / values.length;
        }
    }
}
exports.CustomCalcHandler = CustomCalcHandler;
//# sourceMappingURL=custom-calc.handler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataOutputHandler = void 0;
class DataOutputHandler {
    constructor(sensorDataRepo, sensorRepo) {
        this.sensorDataRepo = sensorDataRepo;
        this.sensorRepo = sensorRepo;
    }
    async execute(node, input) {
        const operation = String(node.data?.operation || 'report_builder');
        try {
            switch (operation) {
                case 'log': return await this.log(node, input);
                case 'report_builder': return this.reportBuilder(node, input);
                case 'csv_format': return this.csvFormat(node, input);
                case 'enrich': return await this.enrich(node, input);
                default: return { value: input, branch: 'out' };
            }
        }
        catch (err) {
            return { error: err instanceof Error ? err.message : String(err), branch: 'error' };
        }
    }
    async log(node, input) {
        const sensorId = String(node.data?.sensorId || '').trim();
        if (!sensorId)
            return { error: 'sensorId not configured', branch: 'error' };
        const sensor = await this.sensorRepo.findOne({ where: { id: sensorId } });
        if (!sensor)
            return { error: `Sensor "${sensorId}" not found`, branch: 'error' };
        const value = this.numericValue(input);
        if (isNaN(value))
            return { error: 'Cannot extract a numeric value from input', branch: 'error' };
        const rawTags = String(node.data?.tags || '').trim();
        let tags = {};
        if (rawTags) {
            try {
                tags = JSON.parse(rawTags);
            }
            catch { }
        }
        const now = new Date();
        const record = this.sensorDataRepo.create({ sensor, value, timestamp: now, source: 'workflow' });
        const saved = await this.sensorDataRepo.save(record);
        await this.sensorRepo.update(sensorId, { lastReading: value, lastReadingAt: now });
        return { recordId: saved.id, sensorId, value, timestamp: now, tags, branch: 'saved' };
    }
    reportBuilder(node, input) {
        const title = String(node.data?.reportTitle || 'Sensor Report');
        const includeStats = String(node.data?.includeStats ?? 'yes') !== 'no';
        const rows = this.toArray(input).slice(0, 100);
        const nums = rows.map(r => {
            if (typeof r === 'number')
                return r;
            const o = r;
            return Number(o?.['value'] ?? o?.['v'] ?? NaN);
        }).filter(v => !isNaN(v));
        const stats = includeStats && nums.length > 0 ? {
            count: nums.length,
            min: Math.round(Math.min(...nums) * 1000) / 1000,
            max: Math.round(Math.max(...nums) * 1000) / 1000,
            avg: Math.round(nums.reduce((s, v) => s + v, 0) / nums.length * 1000) / 1000,
        } : undefined;
        const report = {
            title,
            generatedAt: new Date().toISOString(),
            readingCount: rows.length,
            readings: rows,
            ...(stats ? { stats } : {}),
        };
        return { report, branch: 'report' };
    }
    csvFormat(node, input) {
        const columnsStr = String(node.data?.columns || 'timestamp,value,unit');
        const delimiter = String(node.data?.delimiter || ',').replace('\\t', '\t');
        const includeHeader = String(node.data?.includeHeader ?? 'yes') !== 'no';
        const columns = columnsStr.split(',').map(c => c.trim()).filter(Boolean);
        const rows = this.toArray(input);
        const lines = [];
        if (includeHeader)
            lines.push(columns.join(delimiter));
        rows.forEach(row => {
            const obj = typeof row === 'object' && row !== null ? row : { value: row };
            const cells = columns.map(col => {
                const v = obj[col];
                if (v === undefined || v === null)
                    return '';
                const s = String(v);
                return s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s;
            });
            lines.push(cells.join(delimiter));
        });
        return { csv: lines.join('\n'), rowCount: rows.length, columns, branch: 'csv' };
    }
    async enrich(node, input) {
        const obj = typeof input === 'object' && input !== null ? input : {};
        const sensorId = String(obj['sensorId'] ?? node.data?.sensorId ?? '').trim();
        if (!sensorId)
            return { ...obj, branch: 'out' };
        const sensor = await this.sensorRepo.findOne({
            where: { id: sensorId },
            relations: ['station'],
        });
        if (!sensor)
            return { ...obj, enriched: false, branch: 'out' };
        return {
            ...obj,
            value: obj['value'] ?? sensor.lastReading,
            sensorId: sensor.id,
            sensorName: sensor.name,
            sensorType: sensor.type,
            unit: sensor.unit,
            location: sensor.location,
            minThreshold: sensor.minThreshold,
            maxThreshold: sensor.maxThreshold,
            stationId: sensor.station?.id ?? null,
            stationName: sensor.station?.name ?? null,
            enrichedAt: new Date().toISOString(),
            enriched: true,
            branch: 'out',
        };
    }
    numericValue(input) {
        if (typeof input === 'number')
            return input;
        if (typeof input === 'object' && input !== null) {
            const obj = input;
            const v = obj['value'] ?? obj['current'] ?? obj['normalized'];
            if (v !== undefined)
                return Number(v);
        }
        return Number(input);
    }
    toArray(input) {
        if (Array.isArray(input))
            return input;
        if (typeof input === 'object' && input !== null) {
            const obj = input;
            if (Array.isArray(obj['readings']))
                return obj['readings'];
            if (Array.isArray(obj['sensors']))
                return obj['sensors'];
            if (Array.isArray(obj['items']))
                return obj['items'];
            if (Array.isArray(obj['data']))
                return obj['data'];
        }
        return [input];
    }
}
exports.DataOutputHandler = DataOutputHandler;
//# sourceMappingURL=data-output.handler.js.map
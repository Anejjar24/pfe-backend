"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorReadHandler = void 0;
class SensorReadHandler {
    constructor(sensorRepository) {
        this.sensorRepository = sensorRepository;
    }
    async execute(node) {
        const sensorId = String(node.data?.sensorId || '').trim();
        if (!sensorId) {
            return { error: 'sensorId not configured', value: null };
        }
        const sensor = await this.sensorRepository.findOne({
            where: { id: sensorId },
            relations: ['station'],
        });
        if (!sensor) {
            return { error: `Sensor "${sensorId}" not found`, value: null, status: 'not_found' };
        }
        return {
            sensorId: sensor.id,
            name: sensor.name,
            value: sensor.lastReading,
            unit: sensor.unit,
            timestamp: sensor.lastReadingAt,
            status: sensor.status,
            stationId: sensor.station?.id ?? null,
        };
    }
}
exports.SensorReadHandler = SensorReadHandler;
//# sourceMappingURL=sensor-read.handler.js.map
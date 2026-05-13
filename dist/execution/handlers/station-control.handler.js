"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationControlHandler = void 0;
const Station_entity_1 = require("../../database/entities/Station.entity");
class StationControlHandler {
    constructor(stationsService) {
        this.stationsService = stationsService;
    }
    async execute(node, input) {
        const stationId = String(node.data?.stationId || '').trim();
        const rawStatus = String(node.data?.status || 'normal');
        if (!stationId) {
            return { error: 'stationId not configured', updated: false };
        }
        const status = Object.values(Station_entity_1.StationStatus).includes(rawStatus)
            ? rawStatus
            : Station_entity_1.StationStatus.NORMAL;
        const station = await this.stationsService.update(stationId, { status });
        return {
            updated: true,
            stationId: station.id,
            name: station.name,
            status: station.status,
        };
    }
}
exports.StationControlHandler = StationControlHandler;
//# sourceMappingURL=station-control.handler.js.map
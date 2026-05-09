"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_station_dto_1 = require("./create-station.dto");
class UpdateStationDto extends (0, mapped_types_1.PartialType)(create_station_dto_1.CreateStationDto) {
}
exports.UpdateStationDto = UpdateStationDto;
//# sourceMappingURL=update-station.dto.js.map
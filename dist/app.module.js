"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const flows_module_1 = require("./flows/flows.module");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const realtime_module_1 = require("./realtime/realtime.module");
const iot_module_1 = require("./iot/iot.module");
const stations_module_1 = require("./stations/stations.module");
const sensors_module_1 = require("./sensors/sensors.module");
const alerts_module_1 = require("./alerts/alerts.module");
const maintenance_module_1 = require("./maintenance/maintenance.module");
const analytics_module_1 = require("./analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            realtime_module_1.RealtimeModule,
            iot_module_1.IotModule,
            stations_module_1.StationsModule,
            sensors_module_1.SensorsModule,
            alerts_module_1.AlertsModule,
            maintenance_module_1.MaintenanceModule,
            flows_module_1.FlowsModule,
            analytics_module_1.AnalyticsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
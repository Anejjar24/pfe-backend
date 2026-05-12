"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const User_entity_1 = require("./entities/User.entity");
const Station_entity_1 = require("./entities/Station.entity");
const Sensor_entity_1 = require("./entities/Sensor.entity");
const SensorData_entity_1 = require("./entities/SensorData.entity");
const Alert_entity_1 = require("./entities/Alert.entity");
const Maintenance_entity_1 = require("./entities/Maintenance.entity");
const Workflow_entity_1 = require("./entities/Workflow.entity");
const WorkflowExecution_entity_1 = require("./entities/WorkflowExecution.entity");
const Notification_entity_1 = require("./entities/Notification.entity");
const database_service_1 = require("./database.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST') || 'localhost',
                    port: configService.get('DATABASE_PORT') || 5432,
                    username: configService.get('DATABASE_USER') || 'postgres',
                    password: configService.get('DATABASE_PASSWORD') || 'postgres',
                    database: configService.get('DATABASE_NAME') || 'aquaflow',
                    entities: [
                        User_entity_1.User,
                        Station_entity_1.Station,
                        Sensor_entity_1.Sensor,
                        SensorData_entity_1.SensorData,
                        Alert_entity_1.Alert,
                        Maintenance_entity_1.Maintenance,
                        Workflow_entity_1.Workflow,
                        WorkflowExecution_entity_1.WorkflowExecution,
                        Notification_entity_1.Notification,
                    ],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('NODE_ENV') === 'development',
                    subscribers: [],
                    migrations: configService.get('NODE_ENV') === 'production'
                        ? ['dist/database/migrations/*.js']
                        : [],
                    migrationsRun: false,
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                User_entity_1.User,
                Station_entity_1.Station,
                Sensor_entity_1.Sensor,
                SensorData_entity_1.SensorData,
                Alert_entity_1.Alert,
                Maintenance_entity_1.Maintenance,
                Workflow_entity_1.Workflow,
                WorkflowExecution_entity_1.WorkflowExecution,
                Notification_entity_1.Notification,
            ]),
        ],
        providers: [database_service_1.DatabaseService],
        exports: [typeorm_1.TypeOrmModule, database_service_1.DatabaseService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map
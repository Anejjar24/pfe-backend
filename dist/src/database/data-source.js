"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const Alert_entity_1 = require("./entities/Alert.entity");
const Maintenance_entity_1 = require("./entities/Maintenance.entity");
const Notification_entity_1 = require("./entities/Notification.entity");
const Sensor_entity_1 = require("./entities/Sensor.entity");
const SensorData_entity_1 = require("./entities/SensorData.entity");
const Station_entity_1 = require("./entities/Station.entity");
const User_entity_1 = require("./entities/User.entity");
const Workflow_entity_1 = require("./entities/Workflow.entity");
const WorkflowExecution_entity_1 = require("./entities/WorkflowExecution.entity");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'aquaflow',
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
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    logging: false,
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map
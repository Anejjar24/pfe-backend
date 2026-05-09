"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DatabaseService_1.name);
    }
    async healthCheck() {
        try {
            await this.dataSource.query('SELECT NOW()');
            this.logger.debug('Database health check passed');
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return false;
        }
    }
    async getStats() {
        try {
            const tables = await this.dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);
            const stats = {
                tables: [],
                totalRows: 0,
            };
            for (const table of tables) {
                const countResult = await this.dataSource.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                const count = parseInt(countResult[0].count, 10);
                stats.tables.push({
                    name: table.table_name,
                    rows: count,
                });
                stats.totalRows += count;
            }
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get database stats', error);
            throw error;
        }
    }
    async query(sql, parameters) {
        try {
            return await this.dataSource.query(sql, parameters);
        }
        catch (error) {
            this.logger.error(`Query failed: ${sql}`, error);
            throw error;
        }
    }
    isConnected() {
        return this.dataSource.isInitialized;
    }
    async close() {
        if (this.dataSource.isInitialized) {
            await this.dataSource.destroy();
            this.logger.log('Database connection closed');
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseService);
//# sourceMappingURL=database.service.js.map
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
    async onModuleInit() {
        await this.verifyTimescaleDb();
        await this.setupHypertables();
    }
    async verifyTimescaleDb() {
        try {
            const rows = await this.dataSource.query(`SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'`);
            if (rows.length > 0) {
                this.logger.log(`TimescaleDB extension active (v${rows[0].extversion})`);
            }
            else {
                this.logger.warn('TimescaleDB extension NOT found. ' +
                    'Ensure the postgres/init/01_timescaledb.sql init script ran ' +
                    'and restart with a fresh volume if needed.');
            }
        }
        catch {
            this.logger.warn('Could not verify TimescaleDB extension status');
        }
    }
    async setupHypertables() {
        const tsVersion = await this.getTimescaleVersion();
        if (!tsVersion) {
            this.logger.warn('Skipping hypertable setup — TimescaleDB not available');
            return;
        }
        await this.convertSensorDataToHypertable();
    }
    async convertSensorDataToHypertable() {
        try {
            const existing = await this.dataSource.query(`SELECT hypertable_name
           FROM timescaledb_information.hypertables
          WHERE hypertable_schema = 'public'
            AND hypertable_name   = 'sensor_data'`);
            if (existing.length > 0) {
                this.logger.log('sensor_data: already a TimescaleDB hypertable — skipping');
                return;
            }
            await this.dataSource.query(`SELECT create_hypertable(
            'sensor_data',
            'timestamp',
            chunk_time_interval => INTERVAL '7 days',
            migrate_data        => true,
            if_not_exists       => true
         )`);
            this.logger.log('sensor_data: hypertable created (7-day chunks)');
            await this.dataSource.query(`SELECT add_retention_policy(
            'sensor_data',
            INTERVAL '90 days',
            if_not_exists => true
         )`);
            this.logger.log('sensor_data: retention policy set (90 days)');
            await this.dataSource.query(`ALTER TABLE sensor_data
            SET (
              timescaledb.compress,
              timescaledb.compress_orderby   = 'timestamp DESC',
              timescaledb.compress_segmentby = 'sensor_id'
            )`);
            await this.dataSource.query(`SELECT add_compression_policy(
            'sensor_data',
            INTERVAL '14 days',
            if_not_exists => true
         )`);
            this.logger.log('sensor_data: compression policy set (compress after 14 days)');
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Hypertable setup for sensor_data failed: ${msg}`);
        }
    }
    async getHypertableInfo() {
        try {
            const rows = await this.dataSource.query(`SELECT
            h.hypertable_name,
            h.num_dimensions,
            h.num_chunks,
            h.compression_enabled,
            ts.total_bytes,
            ts.compressed_bytes,
            ROUND(
              CASE WHEN ts.total_bytes > 0
                   THEN (1 - ts.compressed_bytes::numeric / ts.total_bytes) * 100
                   ELSE 0
              END, 2
            ) AS compression_ratio_pct
           FROM timescaledb_information.hypertables h
           LEFT JOIN (
             SELECT hypertable_name,
                    SUM(before_compression_total_bytes)      AS total_bytes,
                    SUM(after_compression_total_bytes)       AS compressed_bytes
               FROM timescaledb_information.chunk_compression_stats
              GROUP BY hypertable_name
           ) ts ON ts.hypertable_name = h.hypertable_name
          WHERE h.hypertable_schema = 'public'
            AND h.hypertable_name   = 'sensor_data'`);
            return rows[0] ?? null;
        }
        catch {
            return null;
        }
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
    async getTimescaleVersion() {
        try {
            const rows = await this.dataSource.query(`SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'`);
            return rows.length > 0 ? rows[0].extversion : null;
        }
        catch {
            return null;
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
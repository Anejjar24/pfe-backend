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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const swagger_1 = require("@nestjs/swagger");
const database_service_1 = require("./database/database.service");
let AppController = class AppController {
    constructor(databaseService, cacheManager) {
        this.databaseService = databaseService;
        this.cacheManager = cacheManager;
    }
    async health(res) {
        const [dbOk, redisOk, timescaleVersion, hypertableInfo] = await Promise.all([
            this.databaseService.healthCheck(),
            this.checkRedis(),
            this.databaseService.getTimescaleVersion(),
            this.databaseService.getHypertableInfo(),
        ]);
        const allOk = dbOk && redisOk;
        if (!allOk) {
            res.status(common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        return {
            status: allOk ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            db: {
                status: dbOk ? 'ok' : 'error',
                timescaledb: timescaleVersion ?? 'not installed',
                hypertable: hypertableInfo
                    ? {
                        chunks: hypertableInfo.num_chunks,
                        compressionEnabled: hypertableInfo.compression_enabled,
                        compressionRatioPct: hypertableInfo.compression_ratio_pct,
                    }
                    : 'not configured',
            },
            redis: { status: redisOk ? 'ok' : 'error' },
        };
    }
    async checkRedis() {
        try {
            await this.cacheManager.set('__health_check', '1', 3000);
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness + readiness check — no auth required' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All systems operational' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'One or more subsystems degraded' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "health", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        cache_manager_1.Cache])
], AppController);
//# sourceMappingURL=app.controller.js.map
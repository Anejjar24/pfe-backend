import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { FlowsModule } from './flows/flows.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RealtimeModule } from './realtime/realtime.module';
import { IotModule } from './iot/iot.module';
import { StationsModule } from './stations/stations.module';
import { SensorsModule } from './sensors/sensors.module';
import { AlertsModule } from './alerts/alerts.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (configService: ConfigService): any => {
        const redisHost = configService.get<string>('REDIS_HOST');
        if (redisHost) {
          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            store: redisStore as any,
            host: redisHost,
            port: configService.get<number>('REDIS_PORT') ?? 6379,
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
            ttl: 300,
          };
        }
        // In-memory fallback when Redis is not configured
        return { ttl: 300, max: 1000 };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    RealtimeModule,
    IotModule,
    StationsModule,
    SensorsModule,
    AlertsModule,
    MaintenanceModule,
    FlowsModule,
    AnalyticsModule,
    NotificationsModule,
    UsersModule,
  ],
})
export class AppModule {}

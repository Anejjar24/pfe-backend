import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlowsModule } from './flows/flows.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RealtimeModule } from './realtime/realtime.module';
import { IotModule } from './iot/iot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    RealtimeModule,
    IotModule,
    FlowsModule,
  ],
})
export class AppModule {}

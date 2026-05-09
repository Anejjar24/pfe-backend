import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from '../database/entities/Alert.entity';
import { Sensor } from '../database/entities/Sensor.entity';
import { Station } from '../database/entities/Station.entity';
import { RealtimeModule } from '../realtime/realtime.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Station, Sensor]), RealtimeModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}

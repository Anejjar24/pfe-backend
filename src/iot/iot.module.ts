import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { RealtimeModule } from '../realtime/realtime.module';
import { IotService } from './iot.service';
import { MqttClient } from './mqtt/mqtt.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, SensorData]),
    RealtimeModule,
  ],
  providers: [IotService, MqttClient],
  exports: [IotService],
})
export class IotModule {}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor, SensorStatus } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class IotService {
  private readonly logger = new Logger(IotService.name);

  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    @InjectRepository(SensorData)
    private readonly sensorDataRepository: Repository<SensorData>,
    private readonly realtimeService: RealtimeService,
  ) {}

  async processSensorData(sensorId: string, value: number): Promise<void> {
    try {
      const sensor = await this.sensorRepository.findOne({
        where: { id: sensorId },
      });

      if (!sensor) {
        this.logger.warn(`Sensor not found: ${sensorId}`);
        return;
      }

      // Update sensor last reading
      sensor.lastReading = value;
      sensor.lastReadingAt = new Date();
      sensor.status = SensorStatus.ACTIVE;

      // Check thresholds
      const thresholdViolated = sensor.isThresholdViolated;

      await this.sensorRepository.save(sensor);

      // Save sensor data
      const sensorData = this.sensorDataRepository.create({
        sensor,
        value,
        timestamp: new Date(),
        qualityFlags: {},
      });
      await this.sensorDataRepository.save(sensorData);

      // Broadcast update via WebSocket
      this.realtimeService.broadcastToAll('sensor-update', {
        sensorId: sensor.id,
        stationId: sensor.station?.id,
        value,
        timestamp: new Date(),
        thresholdViolated,
        status: sensor.status,
      });

      if (thresholdViolated && sensor.alertEnabled) {
        this.logger.warn(
          `Threshold violation for sensor ${sensorId}: ${value}`,
        );
        this.realtimeService.broadcastToAll('threshold-alert', {
          sensorId: sensor.id,
          stationId: sensor.station?.id,
          value,
          minThreshold: sensor.minThreshold,
          maxThreshold: sensor.maxThreshold,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to process sensor data for ${sensorId}`,
        error,
      );
    }
  }

  async getSensorData(
    sensorId: string,
    limit: number = 100,
  ): Promise<SensorData[]> {
    return this.sensorDataRepository.find({
      where: { sensor: { id: sensorId } },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getSensorStatus(sensorId: string): Promise<Sensor | null> {
    return this.sensorRepository.findOne({
      where: { id: sensorId },
    });
  }

  async getActiveStationSensors(stationId: string): Promise<Sensor[]> {
    return this.sensorRepository.find({
      where: {
        station: { id: stationId },
        status: SensorStatus.ACTIVE,
      },
    });
  }
}

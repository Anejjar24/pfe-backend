import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertStatus } from '../database/entities/Alert.entity';
import { Sensor } from '../database/entities/Sensor.entity';
import { Station } from '../database/entities/Station.entity';
import { User } from '../database/entities/User.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { AlertQueryDto } from './dto/alert-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(dto: CreateAlertDto) {
    const station = dto.stationId
      ? await this.stationRepository.findOne({ where: { id: dto.stationId } })
      : null;
    const sensor = dto.sensorId
      ? await this.sensorRepository.findOne({ where: { id: dto.sensorId } })
      : null;

    if (dto.stationId && !station) throw new NotFoundException(`Station "${dto.stationId}" was not found`);
    if (dto.sensorId && !sensor) throw new NotFoundException(`Sensor "${dto.sensorId}" was not found`);

    const alert = await this.alertRepository.save(
      this.alertRepository.create({
        type: dto.type,
        severity: dto.severity,
        message: dto.message,
        description: dto.description,
        data: dto.data,
        sourceSystem: dto.sourceSystem || 'aquaflow',
        station: station || undefined,
        sensor: sensor || undefined,
      }),
    );

    this.realtimeService.broadcastToAll('alert-created', {
      id: alert.id,
      alertId: alert.id,
      severity: alert.severity,
      message: alert.message,
      stationId: station?.id,
      station: station?.name,
      sensorId: sensor?.id,
      timestamp: alert.createdAt,
    });

    return alert;
  }

  async findAll(query: AlertQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, any> = {};

    if (query.status) where.status = query.status;
    if (query.severity) where.severity = query.severity;
    if (query.type) where.type = query.type;
    if (query.stationId) where.station = { id: query.stationId };
    if (query.sensorId) where.sensor = { id: query.sensorId };

    const [data, total] = await this.alertRepository.findAndCount({
      where,
      relations: ['station', 'sensor', 'acknowledgedBy', 'resolvedBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: ['station', 'sensor', 'acknowledgedBy', 'resolvedBy'],
    });
    if (!alert) throw new NotFoundException(`Alert "${id}" was not found`);
    return alert;
  }

  async acknowledge(id: string, user: User) {
    const alert = await this.findOne(id);
    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = user;
    return this.alertRepository.save(alert);
  }

  async resolve(id: string, user: User) {
    const alert = await this.findOne(id);
    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    alert.resolvedBy = user;
    return this.alertRepository.save(alert);
  }
}

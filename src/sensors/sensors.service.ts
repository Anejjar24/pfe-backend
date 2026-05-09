import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Sensor } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { Station } from '../database/entities/Station.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { SensorQueryDto } from './dto/sensor-query.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    @InjectRepository(SensorData)
    private readonly sensorDataRepository: Repository<SensorData>,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
  ) {}

  async create(dto: CreateSensorDto) {
    const station = await this.stationRepository.findOne({ where: { id: dto.stationId } });
    if (!station) throw new NotFoundException(`Station "${dto.stationId}" was not found`);

    const { stationId, ...sensorPayload } = dto;
    const sensor = this.sensorRepository.create({ ...sensorPayload, station });
    return this.sensorRepository.save(sensor);
  }

  async findAll(query: SensorQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, any> = {};

    if (query.stationId) where.station = { id: query.stationId };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [data, total] = await this.sensorRepository.findAndCount({
      where,
      relations: ['station'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const sensor = await this.sensorRepository.findOne({
      where: { id },
      relations: ['station', 'alerts'],
    });
    if (!sensor) throw new NotFoundException(`Sensor "${id}" was not found`);
    return sensor;
  }

  async update(id: string, dto: UpdateSensorDto) {
    const sensor = await this.findOne(id);
    const { stationId, ...sensorPayload } = dto;

    Object.assign(sensor, sensorPayload);
    if (stationId) {
      const station = await this.stationRepository.findOne({ where: { id: stationId } });
      if (!station) throw new NotFoundException(`Station "${stationId}" was not found`);
      sensor.station = station;
    }

    return this.sensorRepository.save(sensor);
  }

  async remove(id: string) {
    const sensor = await this.findOne(id);
    await this.sensorRepository.remove(sensor);
    return { deleted: true, id };
  }

  async findData(sensorId: string, limit = 100) {
    await this.findOne(sensorId);
    return this.sensorDataRepository.find({
      where: { sensor: { id: sensorId } },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}

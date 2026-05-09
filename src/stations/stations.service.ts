import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Station } from '../database/entities/Station.entity';
import { User } from '../database/entities/User.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
  ) {}

  async create(dto: CreateStationDto, user: User) {
    const station = this.stationRepository.create({
      ...dto,
      createdBy: user,
      ...(dto.status ? { lastStatusChange: new Date() } : {}),
    });

    return this.stationRepository.save(station);
  }

  async findAll(query: StationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, any> = {};

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [data, total] = await this.stationRepository.findAndCount({
      where,
      relations: ['createdBy', 'sensors', 'alerts'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const station = await this.stationRepository.findOne({
      where: { id },
      relations: ['createdBy', 'sensors', 'alerts', 'maintenances'],
    });

    if (!station) {
      throw new NotFoundException(`Station "${id}" was not found`);
    }

    return station;
  }

  async update(id: string, dto: UpdateStationDto) {
    const station = await this.findOne(id);
    const statusChanged = dto.status && dto.status !== station.status;

    Object.assign(station, dto);
    if (statusChanged) station.lastStatusChange = new Date();

    return this.stationRepository.save(station);
  }

  async remove(id: string) {
    const station = await this.findOne(id);
    await this.stationRepository.remove(station);
    return { deleted: true, id };
  }
}

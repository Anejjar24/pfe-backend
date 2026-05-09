import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/User.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationsService } from './stations.service';

@Controller('stations')
@UseGuards(JwtGuard, RolesGuard)
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  findAll(@Query() query: StationQueryDto) {
    return this.stationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  create(@Body() dto: CreateStationDto, @Request() req: { user: User }) {
    return this.stationsService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  update(@Param('id') id: string, @Body() dto: UpdateStationDto) {
    return this.stationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.stationsService.remove(id);
  }
}

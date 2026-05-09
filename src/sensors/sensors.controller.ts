import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../database/entities/User.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { SensorQueryDto } from './dto/sensor-query.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SensorsService } from './sensors.service';

@Controller('sensors')
@UseGuards(JwtGuard, RolesGuard)
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get()
  findAll(@Query() query: SensorQueryDto) {
    return this.sensorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorsService.findOne(id);
  }

  @Get(':id/data')
  findData(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.sensorsService.findData(id, Number(limit) || 100);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  create(@Body() dto: CreateSensorDto) {
    return this.sensorsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  update(@Param('id') id: string, @Body() dto: UpdateSensorDto) {
    return this.sensorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.sensorsService.remove(id);
  }
}

import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../database/entities/User.entity';
import { AlertQueryDto } from './dto/alert-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertsService } from './alerts.service';

@Controller('alerts')
@UseGuards(JwtGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@Query() query: AlertQueryDto) {
    return this.alertsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  create(@Body() dto: CreateAlertDto) {
    return this.alertsService.create(dto);
  }

  @Patch(':id/acknowledge')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.TECHNICIAN)
  acknowledge(@Param('id') id: string, @Request() req: { user: User }) {
    return this.alertsService.acknowledge(id, req.user);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.TECHNICIAN)
  resolve(@Param('id') id: string, @Request() req: { user: User }) {
    return this.alertsService.resolve(id, req.user);
  }
}

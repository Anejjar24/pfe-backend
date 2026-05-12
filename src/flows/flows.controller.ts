import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { User } from '../database/entities/User.entity';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CreateFlowDto } from './dto/create-flow.dto';
import { ExecuteFlowDto } from './dto/execute-flow.dto';
import { FlowExecutorService } from './flow-executor.service';
import { FlowsService } from './flows.service';

@UseGuards(JwtGuard)
@Controller('flows')
export class FlowsController {
  constructor(
    private readonly flowsService: FlowsService,
    private readonly executorService: FlowExecutorService,
  ) {}

  @Post()
  create(@Body() dto: CreateFlowDto, @Request() req: { user: User }) {
    return this.flowsService.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.flowsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flowsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateFlowDto, @Request() req: { user: User }) {
    return this.flowsService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flowsService.remove(id);
  }

  @Post('execute')
  execute(@Body() dto: ExecuteFlowDto) {
    return this.executorService.execute(dto.graph, dto.input);
  }
}

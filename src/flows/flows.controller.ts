import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateFlowDto } from './dto/create-flow.dto';
import { ExecuteFlowDto } from './dto/execute-flow.dto';
import { FlowExecutorService } from './flow-executor.service';
import { FlowsService } from './flows.service';

@Controller('flows')
export class FlowsController {
  constructor(
    private readonly flowsService: FlowsService,
    private readonly executorService: FlowExecutorService,
  ) {}

  @Post()
  create(@Body() dto: CreateFlowDto) {
    return this.flowsService.create(dto);
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
  update(@Param('id') id: string, @Body() dto: CreateFlowDto) {
    return this.flowsService.update(id, dto);
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

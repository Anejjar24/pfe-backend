import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../database/entities/User.entity';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CreateFlowDto } from './dto/create-flow.dto';
import { ExecuteFlowDto } from './dto/execute-flow.dto';
import { FlowExecutorService } from './flow-executor.service';
import { FlowsService } from './flows.service';

@ApiTags('flows')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('flows')
export class FlowsController {
  constructor(
    private readonly flowsService: FlowsService,
    private readonly executorService: FlowExecutorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created' })
  create(@Body() dto: CreateFlowDto, @Request() req: { user: User }) {
    return this.flowsService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all workflows' })
  @ApiResponse({ status: 200, description: 'Array of workflow records' })
  findAll() {
    return this.flowsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single workflow' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 200, description: 'Workflow object' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  findOne(@Param('id') id: string) {
    return this.flowsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace a workflow graph' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 200, description: 'Updated workflow' })
  update(@Param('id') id: string, @Body() dto: CreateFlowDto, @Request() req: { user: User }) {
    return this.flowsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.flowsService.remove(id);
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute a workflow graph directly (ad-hoc run)' })
  @ApiResponse({ status: 201, description: 'Execution result with per-node outputs' })
  execute(@Body() dto: ExecuteFlowDto) {
    return this.executorService.execute(dto.graph, dto.input);
  }
}

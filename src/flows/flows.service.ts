import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FlowRecord } from '../database/schemas/flow.schema';
import { CreateFlowDto } from './dto/create-flow.dto';
import { FlowValidatorService } from './flow-validator.service';

@Injectable()
export class FlowsService {
  private readonly flows = new Map<string, FlowRecord>();

  constructor(private readonly validator: FlowValidatorService) {}

  create(dto: CreateFlowDto) {
    this.validator.validate(dto.graph);
    const now = new Date().toISOString();
    const id = dto.graph.id || randomUUID();
    const flow: FlowRecord = {
      id,
      name: dto.name || dto.graph.name || 'Untitled workflow',
      graph: { ...dto.graph, id },
      createdAt: now,
      updatedAt: now,
    };
    this.flows.set(id, flow);
    return flow;
  }

  update(id: string, dto: CreateFlowDto) {
    const current = this.findOne(id);
    this.validator.validate(dto.graph);
    const flow: FlowRecord = {
      ...current,
      name: dto.name || current.name,
      graph: { ...dto.graph, id },
      updatedAt: new Date().toISOString(),
    };
    this.flows.set(id, flow);
    return flow;
  }

  findAll() {
    return Array.from(this.flows.values());
  }

  findOne(id: string) {
    const flow = this.flows.get(id);
    if (!flow) throw new NotFoundException(`Workflow "${id}" was not found.`);
    return flow;
  }

  remove(id: string) {
    this.findOne(id);
    this.flows.delete(id);
    return { deleted: true, id };
  }
}

import { IsObject, IsOptional, IsString } from 'class-validator';
import { WorkflowGraph } from '../../common/types/workflow.types';

export class CreateFlowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  graph!: WorkflowGraph;
}

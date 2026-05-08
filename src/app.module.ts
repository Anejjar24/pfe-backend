import { Module } from '@nestjs/common';
import { FlowsModule } from './flows/flows.module';

@Module({
  imports: [FlowsModule],
})
export class AppModule {}

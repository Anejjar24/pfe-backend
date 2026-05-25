import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Liveness check — no auth required' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

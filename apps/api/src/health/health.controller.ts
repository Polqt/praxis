import { Controller, Get, HttpCode } from '@nestjs/common'
import { HealthService } from './health.service'

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('live')
  @HttpCode(200)
  live() {
    return { status: 'ok' }
  }

  @Get('ready')
  async ready() {
    return this.health.ready()
  }
}

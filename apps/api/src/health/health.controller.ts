import { Controller, Get, Headers, HttpCode } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { HealthService } from './health.service'

@SkipThrottle()
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

  @Get('auth')
  async auth(@Headers('authorization') authorization?: string) {
    return this.health.auth(authorization)
  }
}

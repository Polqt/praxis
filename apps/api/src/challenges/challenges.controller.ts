import { Controller, Get, Param } from '@nestjs/common'
import { ChallengesService } from './challenges.service'

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  listActive() {
    return this.challengesService.listActive()
  }

  @Get(':id')
  getActive(@Param('id') id: string) {
    return this.challengesService.getActive(id)
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common'
import { ChallengesService } from './challenges.service'
import { ReportsService } from '../reports/reports.service'

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get()
  listActive(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.challengesService.listActive(
      limit ? Math.min(parseInt(limit, 10) || 50, 100) : 50,
      offset ? Math.max(parseInt(offset, 10) || 0, 0) : 0,
    )
  }

  @Get(':id')
  getActive(@Param('id') id: string) {
    return this.challengesService.getActive(id)
  }

  @Get(':id/leaderboard')
  getLeaderboard(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getChallengeLeaderboard(
      id,
      limit ? Math.min(parseInt(limit, 10) || 25, 100) : 25,
    )
  }
}

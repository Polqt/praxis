import { Controller, Get, Param, Query } from '@nestjs/common'
import { ChallengesService } from './challenges.service'
import { ReportsService } from '../reports/reports.service'

function parseIntParam(value: string | undefined, fallback: number, max: number): number {
  if (!value) return fallback
  return Math.min(Math.max(parseInt(value, 10) || fallback, 0), max)
}

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
      parseIntParam(limit, 50, 100),
      parseIntParam(offset, 0, Infinity),
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
      parseIntParam(limit, 25, 100),
    )
  }
}

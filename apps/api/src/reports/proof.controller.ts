import { Controller, Get, Header, Param, Query } from '@nestjs/common'
import { ReportsService } from './reports.service'

@Controller('proof')
export class ProofController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  listPublicProofs(@Query('limit') limit?: string) {
    const parsedLimit = Math.min(Math.max(parseInt(limit ?? '50', 10) || 50, 1), 100)
    return this.reports.listPublicProofs(parsedLimit)
  }

  @Get(':publicToken/meta')
  getPublicProofMeta(@Param('publicToken') publicToken: string) {
    return this.reports.getPublicProofMeta(publicToken)
  }

  @Get(':publicToken')
  getPublicProof(@Param('publicToken') publicToken: string) {
    return this.reports.getPublicProof(publicToken)
  }
}

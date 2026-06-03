import { Controller, Get, Param } from '@nestjs/common'
import { ReportsService } from './reports.service'

@Controller('proof')
export class ProofController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  listPublicProofs() {
    return this.reports.listPublicProofs()
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

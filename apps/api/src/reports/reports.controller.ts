import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { IsBoolean } from 'class-validator'
import { User } from '@praxis/shared'
import { GetUser } from '../auth/get-user.decorator'
import { SupabaseGuard } from '../auth/supabase.guard'
import { ReportsService } from './reports.service'

class ReportVisibilityDto {
  @IsBoolean()
  isPublic: boolean
}

@Controller('reports')
@UseGuards(SupabaseGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('submissions/:submissionId')
  getPrivateReport(@GetUser() user: User, @Param('submissionId') submissionId: string) {
    return this.reports.getPrivateReport(user.id, submissionId)
  }

  @Patch('submissions/:submissionId/visibility')
  setVisibility(
    @GetUser() user: User,
    @Param('submissionId') submissionId: string,
    @Body() dto: ReportVisibilityDto,
  ) {
    return this.reports.setVisibility(user.id, submissionId, dto.isPublic)
  }
}

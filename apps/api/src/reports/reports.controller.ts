import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { User } from '@praxis/shared'
import { GetUser } from '../auth/get-user.decorator'
import { SupabaseGuard } from '../auth/supabase.guard'
import { ReportVisibilityDto } from './dto/report-visibility.dto'
import { ReportsService } from './reports.service'

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

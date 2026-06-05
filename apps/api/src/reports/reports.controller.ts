import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { User } from '@praxis/shared'
import { GetUser } from '../auth/get-user.decorator'
import { SupabaseGuard } from '../auth/supabase.guard'
import { ReportVisibilityDto } from './dto/report-visibility.dto'
import { ReportFeedbackDto } from './dto/report-feedback.dto'
import { ReportsService } from './reports.service'

@Controller('reports')
@UseGuards(SupabaseGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('feedback/analytics')
  getFeedbackAnalytics() {
    return this.reports.getFeedbackAnalytics()
  }

  @Get('debug/skills')
  getSkillsDebug(@GetUser() user: User) {
    return this.reports.getSkillsDebug(user.id)
  }

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

  @Get('submissions/:submissionId/execution')
  getExecution(@GetUser() user: User, @Param('submissionId') submissionId: string) {
    return this.reports.getExecutionForSubmission(user.id, submissionId)
  }

  @Post('submissions/:submissionId/feedback')
  submitFeedback(
    @GetUser() user: User,
    @Param('submissionId') submissionId: string,
    @Body() dto: ReportFeedbackDto,
  ) {
    return this.reports.submitFeedback(user.id, submissionId, dto)
  }
}

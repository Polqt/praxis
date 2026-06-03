import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { User } from '@praxis/shared'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { SubmissionsService } from './submissions.service'

@Controller('submissions')
@UseGuards(SupabaseGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  listForUser(@GetUser() user: User) {
    return this.submissionsService.listForUser(user.id)
  }

  @Get('stats')
  getStats(@GetUser() user: User) {
    return this.submissionsService.getStats(user.id)
  }

  @Get('unread')
  getUnreadCount(@GetUser() user: User) {
    return this.submissionsService.getUnreadCount(user.id)
  }

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(user.id, dto)
  }

  @Get(':id')
  getForUser(@GetUser() user: User, @Param('id') id: string) {
    return this.submissionsService.getForUser(user.id, id)
  }

  @Get(':id/events')
  listEventsForUser(@GetUser() user: User, @Param('id') id: string) {
    return this.submissionsService.listEventsForUser(user.id, id)
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelSubmission(@GetUser() user: User, @Param('id') id: string) {
    return this.submissionsService.cancelSubmission(user.id, id)
  }

  @Patch(':id/requeue')
  @HttpCode(HttpStatus.OK)
  requeueSubmission(@GetUser() user: User, @Param('id') id: string) {
    return this.submissionsService.requeueSubmission(user.id, id)
  }

  @Patch(':id/retry')
  @HttpCode(HttpStatus.OK)
  retrySubmission(@GetUser() user: User, @Param('id') id: string) {
    return this.submissionsService.retrySubmission(user.id, id)
  }

  @Patch(':id/viewed')
  @HttpCode(HttpStatus.OK)
  markViewed(@GetUser() user: User, @Param('id') id: string) {
    return this.submissionsService.markViewed(user.id, id)
  }
}

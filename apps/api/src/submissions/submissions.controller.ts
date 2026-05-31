import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { User } from '@praxis/shared'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { CreateSubmissionDto } from './submissions.dto'
import { SubmissionsService } from './submissions.service'

@Controller('submissions')
@UseGuards(SupabaseGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  listForUser(@GetUser() user: User) {
    return this.submissionsService.listForUser(user.id)
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
}

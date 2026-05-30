import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { TasksService } from './tasks.service'
import { User } from '@praxis/shared'

@Controller('tasks')
@UseGuards(SupabaseGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@GetUser() user: User) {
    return this.tasksService.findAll(user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.findOne(id, user.id)
  }
}

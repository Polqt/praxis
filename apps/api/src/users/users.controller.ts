import { Controller, Get, UseGuards } from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { UsersService } from './users.service'
import { User } from '@praxis/shared'

@Controller('users')
@UseGuards(SupabaseGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return this.usersService.getMe(user.id)
  }

  @Get('me/skills')
  getMySkills(@GetUser() user: User) {
    return this.usersService.getUserSkills(user.id)
  }

  @Get('me/dashboard')
  getDashboard(@GetUser() user: User) {
    return this.usersService.getDashboardStats(user.id)
  }
}

import {
  Body,
  ConflictException,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { UsersService } from './users.service'
import { UpdateUserDto } from './users.dto'
import { User } from '@praxis/shared'

@Controller('users')
@UseGuards(SupabaseGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return this.usersService.getMe(user.id)
  }

  @Patch('me')
  async updateMe(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    const existing = await this.usersService.findByUsername(dto.username)
    if (existing && existing.id !== user.id) {
      throw new ConflictException('Username is already taken')
    }
    return this.usersService.updateUser(user.id, { username: dto.username })
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

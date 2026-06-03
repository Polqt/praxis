import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { PublicProfileDto } from './dto/public-profile.dto'
import { User } from '@praxis/shared'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('leaderboard')
  getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = Math.min(parseInt(limit ?? '50', 10) || 50, 100)
    const parsedOffset = parseInt(offset ?? '0', 10) || 0
    return this.usersService.getLeaderboard(parsedLimit, parsedOffset)
  }

  @Get('check-username')
  async checkUsername(@Query('username') username: string) {
    if (!username) throw new BadRequestException('username query param is required')
    const normalized = username.trim().toLowerCase()
    const existing = await this.usersService.findByUsername(normalized)
    return { available: !existing }
  }

  @Get(':username/profile')
  async getPublicProfile(@Param('username') username: string): Promise<PublicProfileDto> {
    const profile = await this.usersService.findPublicProfile(username)
    if (!profile) throw new NotFoundException('User not found')
    return profile
  }

  @UseGuards(SupabaseGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.usersService.getMe(user.id)
  }

  @UseGuards(SupabaseGuard)
  @Patch('me')
  async updateMe(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    const normalized = dto.username.trim().toLowerCase()
    const existing = await this.usersService.findByUsername(normalized)
    if (existing && existing.id !== user.id) {
      throw new ConflictException('This username is already taken.')
    }
    return this.usersService.updateUser(user.id, { username: normalized })
  }

  @UseGuards(SupabaseGuard)
  @Get('me/skills')
  getMySkills(@GetUser() user: User) {
    return this.usersService.getUserSkills(user.id)
  }

  @UseGuards(SupabaseGuard)
  @Get('me/dashboard')
  getDashboard(@GetUser() user: User) {
    return this.usersService.getDashboardStats(user.id)
  }
}

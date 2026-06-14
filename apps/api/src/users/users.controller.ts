import {
  BadRequestException,
  Body,
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
import { UpdateBioDto } from './dto/update-bio.dto'
import { PublicProfileDto } from './dto/public-profile.dto'
import { User } from '@praxis/shared'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('leaderboard')
  getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('period') period?: string,
  ) {
    const parsedLimit = Math.min(Math.max(parseInt(limit ?? '50', 10) || 50, 1), 100)
    const parsedOffset = Math.max(parseInt(offset ?? '0', 10) || 0, 0)
    const validPeriod: 'all' | 'month' | 'week' = period === 'month' || period === 'week' ? period : 'all'
    return this.usersService.getLeaderboard(parsedLimit, parsedOffset, validPeriod)
  }

  @Get('check-username')
  async checkUsername(@Query('username') username: string) {
    if (!username) throw new BadRequestException('username query param is required')
    const normalized = username.trim().toLowerCase()
    if (UsersService.RESERVED_USERNAMES.has(normalized)) return { available: false }
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
  updateMe(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    const normalized = dto.username.trim().toLowerCase()
    return this.usersService.updateUser(user.id, { username: normalized })
  }

  @UseGuards(SupabaseGuard)
  @Get('me/dashboard')
  getDashboard(@GetUser() user: User) {
    return this.usersService.getDashboardStats(user.id)
  }

  @UseGuards(SupabaseGuard)
  @Get('me/rank')
  getMyRank(@GetUser() user: User) {
    return this.usersService.getMyRank(user.id)
  }

  @UseGuards(SupabaseGuard)
  @Patch('me/bio')
  updateBio(@GetUser() user: User, @Body() dto: UpdateBioDto) {
    return this.usersService.updateBio(user.id, dto.bio)
  }

  @UseGuards(SupabaseGuard)
  @Get('me/score-history')
  getScoreHistory(@GetUser() user: User) {
    return this.usersService.getScoreHistory(user.id)
  }
}

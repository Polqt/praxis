import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common'
import { User } from '@praxis/shared'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { SyncGitHubAccountDto } from './github.dto'
import { GitHubService } from './github.service'

@Controller('github')
@UseGuards(SupabaseGuard)
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('account')
  getAccount(@GetUser() user: User) {
    return this.githubService.getAccount(user.id)
  }

  @Post('sync')
  syncAccount(@GetUser() user: User, @Body() dto: SyncGitHubAccountDto) {
    return this.githubService.syncAccount(user.id, dto.accessToken)
  }

  @Delete('account')
  disconnect(@GetUser() user: User) {
    return this.githubService.disconnect(user.id)
  }
}

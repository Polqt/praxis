import { Body, Controller, Delete, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { User } from '@praxis/shared'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { SyncGitHubAccountDto } from './dto/sync-github-account.dto'
import { GitHubService } from './github.service'

@Controller('github')
@UseGuards(SupabaseGuard)
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('account')
  getAccount(@GetUser() user: User) {
    return this.githubService.getAccount(user.id)
  }

  @Get('repos')
  getUserRepos(@GetUser() user: User) {
    return this.githubService.getUserRepos(user.id)
  }

  @Post('sync')
  @HttpCode(204)
  async syncAccount(@GetUser() user: User, @Body() dto: SyncGitHubAccountDto) {
    await this.githubService.syncAccount(user.id, dto.accessToken)
  }

  @Delete('account')
  @HttpCode(204)
  async disconnect(@GetUser() user: User) {
    await this.githubService.disconnect(user.id)
  }
}

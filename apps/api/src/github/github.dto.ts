import { IsNotEmpty, IsString } from 'class-validator'

export class SyncGitHubAccountDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string
}

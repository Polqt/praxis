import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SyncGitHubAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  accessToken: string
}

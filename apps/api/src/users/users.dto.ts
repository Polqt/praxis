import { IsString, Matches, MinLength, MaxLength } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'username may only contain lowercase letters, numbers, hyphens, and underscores',
  })
  username: string
}

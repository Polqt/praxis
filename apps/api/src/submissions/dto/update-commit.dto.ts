import { IsString, Length, Matches } from 'class-validator'

export class UpdateCommitDto {
  @IsString()
  @Length(7, 40)
  @Matches(/^[0-9a-f]+$/i, { message: 'commitSha must be a valid hex SHA' })
  commitSha!: string
}

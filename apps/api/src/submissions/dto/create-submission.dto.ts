import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string

  @IsString()
  @Matches(/^[^/]+\/[^/]+$/)
  @MaxLength(200)
  githubRepoFullName: string

  @IsString()
  @IsOptional()
  commitSha?: string
}

import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string

  @IsString()
  @Matches(/^[^/]+\/[^/]+$/)
  githubRepoFullName: string

  @IsString()
  @IsOptional()
  commitSha?: string
}

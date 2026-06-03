import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class ReportFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  accuracyRating: number

  @IsOptional()
  @IsString()
  missedEvidence?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsBoolean()
  wouldShare?: boolean
}

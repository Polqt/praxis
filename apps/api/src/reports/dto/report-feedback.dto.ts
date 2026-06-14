import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class ReportFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  accuracyRating: number

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  missedEvidence?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string

  @IsOptional()
  @IsBoolean()
  wouldShare?: boolean
}

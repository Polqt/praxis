import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateBioDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string
}

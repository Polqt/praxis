import { IsBoolean } from 'class-validator'

export class ReportVisibilityDto {
  @IsBoolean()
  isPublic: boolean
}

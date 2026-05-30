import { IsString, IsNotEmpty } from 'class-validator'

export class VerifyRequestDto {
  @IsString()
  @IsNotEmpty()
  taskId: string

  @IsString()
  @IsNotEmpty()
  code: string
}

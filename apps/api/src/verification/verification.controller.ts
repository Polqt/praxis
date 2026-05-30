import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { VerificationService } from './verification.service'
import { VerifyRequestDto } from './verification.dto'
import { User } from '@praxis/shared'

@Controller('verification')
@UseGuards(SupabaseGuard)
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('run')
  run(@Body() dto: VerifyRequestDto, @GetUser() user: User) {
    return this.verificationService.verify(user.id, dto.taskId, dto.code)
  }
}

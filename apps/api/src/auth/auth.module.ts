import { Module, forwardRef } from '@nestjs/common'
import { SupabaseGuard } from './supabase.guard'
import { JwksService } from './jwks.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [JwksService, SupabaseGuard],
  exports: [SupabaseGuard, JwksService],
})
export class AuthModule {}

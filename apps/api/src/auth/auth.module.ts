import { Module, forwardRef } from '@nestjs/common'
import { SupabaseGuard } from './supabase.guard'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [SupabaseGuard],
  exports: [SupabaseGuard],
})
export class AuthModule {}

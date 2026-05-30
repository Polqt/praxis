import { Module } from '@nestjs/common'
import { SupabaseGuard } from './supabase.guard'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],
  providers: [SupabaseGuard],
  exports: [SupabaseGuard],
})
export class AuthModule {}

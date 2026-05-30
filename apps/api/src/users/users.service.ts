import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async getOrCreateUser(supabaseUid: string, email: string) {
    // Full implementation in Task 8
    return { id: '', supabaseUid, email, username: null, createdAt: new Date().toISOString() }
  }
}

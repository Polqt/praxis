import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres = require('postgres')
import * as schema from './schema'

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: ReturnType<typeof postgres>
  db: ReturnType<typeof drizzle<typeof schema>>

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = postgres(this.config.get('database.url')!, { max: 10 })
    this.db = drizzle(this.client, { schema })
  }
}

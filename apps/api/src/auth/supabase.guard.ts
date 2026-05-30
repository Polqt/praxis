import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import { UsersService } from '../users/users.service'

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }

    const token = authHeader.split(' ')[1]
    const secret = this.config.get<string>('supabase.jwtSecret')!

    let payload: { sub: string; email: string }
    try {
      payload = jwt.verify(token, secret) as { sub: string; email: string }
    } catch {
      throw new UnauthorizedException()
    }

    const user = await this.usersService.getOrCreateUser(payload.sub, payload.email)
    request.user = user
    return true
  }
}

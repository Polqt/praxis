import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { UsersService } from '../users/users.service'
import { JwksService } from './jwks.service'

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(
    private jwks: JwksService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.decode(token, { complete: true })
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      throw new UnauthorizedException()
    }

    let publicKey: jwt.Secret
    try {
      publicKey = await this.jwks.getKey(decoded.header.kid) as any
    } catch {
      throw new UnauthorizedException()
    }

    let payload: { sub: string; email: string }
    try {
      payload = jwt.verify(token, publicKey, { algorithms: ['ES256'] }) as { sub: string; email: string }
    } catch {
      throw new UnauthorizedException()
    }

    const user = await this.usersService.getOrCreateUser(payload.sub, payload.email)
    request.user = user
    return true
  }
}

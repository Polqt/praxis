import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import { UsersService } from '../users/users.service'
import { JwksService } from './jwks.service'

type SupabaseJwtPayload = {
  sub: string
  email?: string
  user_metadata?: {
    email?: string
  }
}

@Injectable()
export class SupabaseGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseGuard.name)

  constructor(
    private jwks: JwksService,
    private config: ConfigService,
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
    if (!decoded || typeof decoded === 'string') {
      throw new UnauthorizedException()
    }

    const algorithm = decoded.header.alg
    if (!algorithm || !['ES256', 'RS256', 'HS256'].includes(algorithm)) {
      this.logger.warn(`Rejected Supabase JWT with unsupported alg=${algorithm ?? 'missing'}`)
      throw new UnauthorizedException()
    }

    let secret: jwt.Secret
    try {
      if (algorithm === 'HS256') {
        const jwtSecret = this.config.get<string>('supabase.jwtSecret')
        if (!jwtSecret) {
          this.logger.warn('Rejected HS256 Supabase JWT because SUPABASE_JWT_SECRET is not configured')
          throw new UnauthorizedException()
        }
        secret = jwtSecret
      } else {
        if (!decoded.header.kid) {
          this.logger.warn(`Rejected ${algorithm} Supabase JWT without kid`)
          throw new UnauthorizedException()
        }
        secret = await this.jwks.getKey(decoded.header.kid)
      }
    } catch {
      throw new UnauthorizedException()
    }

    let payload: SupabaseJwtPayload
    try {
      payload = jwt.verify(token, secret, {
        algorithms: [algorithm as jwt.Algorithm],
        audience: 'authenticated',
      }) as SupabaseJwtPayload
    } catch {
      throw new UnauthorizedException()
    }

    if (!payload.email && !payload.user_metadata?.email) {
      this.logger.warn(`Supabase JWT for user ${payload.sub} did not include email; using fallback local email`)
    }
    const email = payload.email ?? payload.user_metadata?.email ?? `${payload.sub}@no-email.praxis.local`
    const user = await this.usersService.getOrCreateUser(payload.sub, email)
    request.user = user
    return true
  }
}

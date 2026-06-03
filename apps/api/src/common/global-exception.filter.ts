import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { AbstractHttpAdapter } from '@nestjs/core'

interface RequestWithId {
  method: string
  url: string
  requestId?: string
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  constructor(private readonly httpAdapter: AbstractHttpAdapter) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<RequestWithId>()
    const requestId = request.requestId

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException
      ? (() => {
          const res = exception.getResponse()
          return typeof res === 'string' ? res : (res as { message?: string }).message ?? exception.message
        })()
      : 'Internal server error'

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    } else if (status === 401 || status === 403) {
      this.logger.warn(`${request.method} ${request.url} → ${status}`)
    }

    const body: Record<string, unknown> = { statusCode: status, message, requestId }

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      body.stack = exception.stack
    }

    this.httpAdapter.reply(ctx.getResponse(), body, status)
  }
}

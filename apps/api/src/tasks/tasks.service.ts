import { Injectable } from '@nestjs/common'

/**
 * TasksService is deprecated in v1.
 * Task-based challenges are superseded by project-based verification.
 * This stub keeps the module compilable until TasksModule is removed from AppModule.
 */
@Injectable()
export class TasksService {
  findAll(_userId: string) {
    return []
  }

  findOne(_taskId: string, _userId: string) {
    return null
  }
}

import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { tasks, userTasks } from '../database/schema'

const TASK_PUBLIC_FIELDS = {
  id: tasks.id,
  title: tasks.title,
  description: tasks.description,
  language: tasks.language,
  difficulty: tasks.difficulty,
  starterCode: tasks.starterCode,
  skillTags: tasks.skillTags,
  createdAt: tasks.createdAt,
}

@Injectable()
export class TasksService {
  constructor(private db: DatabaseService) {}

  async findAll(userId: string) {
    const allTasks = await this.db.db.select(TASK_PUBLIC_FIELDS).from(tasks)

    const userTaskRows = await this.db.db
      .select()
      .from(userTasks)
      .where(eq(userTasks.userId, userId))

    const statusMap = new Map(userTaskRows.map(ut => [ut.taskId, ut]))

    return allTasks.map(task => {
      const ut = statusMap.get(task.id)
      return {
        ...task,
        status: ut?.status ?? 'PENDING',
        latestCode: ut?.latestCode ?? null,
        attempts: ut?.attempts ?? 0,
        feedback: ut?.feedback ?? null,
        verifiedAt: ut?.verifiedAt ?? null,
      }
    })
  }

  async findOne(taskId: string, userId: string) {
    const taskRows = await this.db.db
      .select(TASK_PUBLIC_FIELDS)
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (!taskRows[0]) throw new NotFoundException('Task not found')

    const utRows = await this.db.db
      .select()
      .from(userTasks)
      .where(eq(userTasks.taskId, taskId))
      .limit(1)

    const ut = utRows[0]
    return {
      ...taskRows[0],
      status: ut?.status ?? 'PENDING',
      latestCode: ut?.latestCode ?? null,
      attempts: ut?.attempts ?? 0,
      feedback: ut?.feedback ?? null,
      verifiedAt: ut?.verifiedAt ?? null,
    }
  }
}

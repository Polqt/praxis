import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, sql } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { tasks, userTasks, skills, userSkills } from '../database/schema'
import { SandboxService } from './sandbox.service'
import { AgentService } from './agent.service'
import { VerifyResponse } from '@praxis/shared'

@Injectable()
export class VerificationService {
  constructor(
    private db: DatabaseService,
    private sandbox: SandboxService,
    private agent: AgentService,
  ) {}

  async verify(userId: string, taskId: string, code: string): Promise<VerifyResponse> {
    const taskRows = await this.db.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (!taskRows[0]) throw new NotFoundException('Task not found')
    const task = taskRows[0]

    await this.db.db
      .insert(userTasks)
      .values({ userId, taskId, status: 'IN_PROGRESS', latestCode: code, attempts: 1 })
      .onConflictDoUpdate({
        target: [userTasks.userId, userTasks.taskId],
        set: {
          status: 'IN_PROGRESS',
          latestCode: code,
          attempts: sql`${userTasks.attempts} + 1`,
          updatedAt: new Date(),
        },
      })

    let sandboxResult
    try {
      sandboxResult = await this.sandbox.runVerification(code, task.testCode)
    } catch {
      return {
        verified: false,
        feedback: 'Execution timed out. Check for infinite loops.',
        executionOutput: '',
      }
    }

    const analysis = await this.agent.analyze(sandboxResult, task)

    await this.db.db
      .update(userTasks)
      .set({
        status: analysis.verified ? 'VERIFIED' : 'FAILED',
        feedback: analysis.message ?? analysis.feedback ?? null,
        verifiedAt: analysis.verified ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)))

    if (analysis.verified) {
      for (const tag of task.skillTags) {
        const skillRows = await this.db.db
          .select()
          .from(skills)
          .where(eq(skills.name, tag))
          .limit(1)

        if (skillRows[0]) {
          await this.db.db
            .insert(userSkills)
            .values({ userId, skillId: skillRows[0].id })
            .onConflictDoNothing()
        }
      }
    }

    return {
      verified: analysis.verified,
      message: analysis.message,
      feedback: analysis.feedback,
      executionOutput: sandboxResult.stdout,
    }
  }
}

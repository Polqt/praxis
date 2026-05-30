import { pgTable, text, timestamp, integer, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const languageEnum = pgEnum('language', ['python'])
export const difficultyEnum = pgEnum('difficulty', ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
export const taskStatusEnum = pgEnum('task_status', ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'FAILED'])

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  supabaseUid: text('supabase_uid').unique().notNull(),
  email: text('email').notNull(),
  username: text('username'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  language: languageEnum('language').notNull().default('python'),
  difficulty: difficultyEnum('difficulty').notNull(),
  starterCode: text('starter_code').notNull(),
  testCode: text('test_code').notNull(),
  skillTags: text('skill_tags').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userTasks = pgTable('user_tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  taskId: text('task_id').notNull().references(() => tasks.id),
  status: taskStatusEnum('status').notNull().default('PENDING'),
  latestCode: text('latest_code'),
  attempts: integer('attempts').notNull().default(0),
  feedback: text('feedback'),
  verifiedAt: timestamp('verified_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [uniqueIndex('user_tasks_user_id_task_id_idx').on(t.userId, t.taskId)])

export const skills = pgTable('skills', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').unique().notNull(),
  category: text('category').notNull(),
})

export const userSkills = pgTable('user_skills', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  skillId: text('skill_id').notNull().references(() => skills.id),
  verifiedAt: timestamp('verified_at').defaultNow().notNull(),
})

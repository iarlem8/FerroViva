import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import type { Campaign, Point, Report } from '../demo-data'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  role: text('role').notNull().default('citizen'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull().default('Notícia'),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  userId: text('userId').notNull(),
})

export const points = pgTable('points', {
  id: text('id').primaryKey(),
  data: jsonb('data').$type<Point>().notNull(),
})

export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  data: jsonb('data').$type<Campaign>().notNull(),
})

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  codeHash: text('codeHash').notNull(),
  userId: text('userId').references(() => user.id, { onDelete: 'set null' }),
  data: jsonb('data').$type<Report>().notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

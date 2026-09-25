import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const fitnessState = sqliteTable('fitness_state', {
 userId: text('user_id').primaryKey(),
 payload: text('payload').notNull(),
 revision: integer('revision').notNull().default(0),
 updatedAt: text('updated_at').notNull(),
});
export const familyProfiles = sqliteTable('family_profiles', {
 id: text('id').primaryKey(),
 ownerId: text('owner_id').notNull(),
 name: text('name').notNull(),
 createdAt: text('created_at').notNull(),
}, (table) => [index('family_profiles_owner_idx').on(table.ownerId)]);
export const appUsers = sqliteTable('app_users', {
 userId: text('user_id').primaryKey(),
 email: text('email').notNull(),
 isOwner: integer('is_owner').notNull().default(0),
 firstSeen: text('first_seen').notNull(),
 lastSeen: text('last_seen').notNull(),
}, (table) => [index('app_users_last_seen_idx').on(table.lastSeen)]);
export const healthLinks = sqliteTable('health_links', {
 scope: text('scope').primaryKey(), tokenHash: text('token_hash').notNull().unique(),
 createdAt: text('created_at').notNull(), lastReceived: text('last_received'),
 rateStart: integer('rate_start').notNull().default(0), rateCount: integer('rate_count').notNull().default(0),
});
export const healthDaily = sqliteTable('health_daily', {
 id: text('id').primaryKey(), scope: text('scope').notNull(), day: text('day').notNull(),
 metric: text('metric').notNull(), payload: text('payload').notNull(), updatedAt: text('updated_at').notNull(),
},table=>[index('health_daily_scope_day_idx').on(table.scope,table.day)]);

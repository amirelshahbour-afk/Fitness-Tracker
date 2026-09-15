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

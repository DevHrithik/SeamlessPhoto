import {
  integer,
  pgTable,
  varchar,
  timestamp,
  decimal,
  date,
} from "drizzle-orm/pg-core";

export const User = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // Clerk-generated ID as primary key (varchar)
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  // Existing plan field
  plan: varchar("plan", { length: 20 }).default("free"), // e.g., free, pro, enterprise

  // Enhanced subscription fields
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default(
    "free",
  ), // free, starter, basic, pro, growth, scale, enterprise
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default(
    "inactive",
  ), // active, inactive, cancelled, past_due
  billingCycle: varchar("billing_cycle", { length: 10 }).default("monthly"), // monthly, annual

  // Minutes tracking
  remainingSeconds: integer("remaining_seconds").default(30), // Default 30 seconds for free trial
  includedMinutes: integer("included_minutes").default(0), // Minutes included in the plan
  extraMinutesRate: decimal("extra_minutes_rate", { precision: 4, scale: 2 }), // Rate for additional minutes

  // Stripe integration
  stripeCustomerId: varchar("stripe_customer_id"), // For payment integration
  stripeSubscriptionId: varchar("stripe_subscription_id"), // Stripe subscription ID

  // Billing dates
  subscriptionStartDate: date("subscription_start_date"),
  subscriptionEndDate: date("subscription_end_date"),
  nextBillingDate: date("next_billing_date"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

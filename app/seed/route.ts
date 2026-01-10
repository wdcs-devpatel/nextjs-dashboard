import 'server-only';

import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { users, customers, invoices, revenue } from '../lib/placeholder-data';

// ✅ Use the SAME env var everywhere (match Vercel settings)
const sql = postgres(process.env.DATABASE_URL_UNPOOLED!, {
  ssl: 'require',
});

export async function GET() {
  try {
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // ⚠️ DEV ONLY: drop existing tables
    await sql`DROP TABLE IF EXISTS invoices`;
    await sql`DROP TABLE IF EXISTS customers`;
    await sql`DROP TABLE IF EXISTS revenue`;
    await sql`DROP TABLE IF EXISTS users`;

    // ======================
    // USERS
    // ======================
    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword});
      `;
    }

    // ======================
    // CUSTOMERS
    // ======================
    await sql`
      CREATE TABLE customers (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        image_url TEXT NOT NULL
      );
    `;

    for (const customer of customers) {
      await sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (
          ${customer.id},
          ${customer.name},
          ${customer.email},
          ${customer.image_url}
        );
      `;
    }

    // ======================
    // INVOICES
    // ======================
    await sql`
      CREATE TABLE invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status TEXT NOT NULL,
        date DATE NOT NULL
      );
    `;

    for (const invoice of invoices) {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (
          ${invoice.customer_id},
          ${invoice.amount},
          ${invoice.status},
          ${invoice.date}
        );
      `;
    }

    // ======================
    // REVENUE
    // ======================
    await sql`
      CREATE TABLE revenue (
        month TEXT PRIMARY KEY,
        revenue INT NOT NULL
      );
    `;

    for (const rev of revenue) {
      await sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue});
      `;
    }

    return Response.json({
      message: 'Database seeded successfully ✅',
    });
  } catch (error) {
    console.error('SEED ERROR:', error);

    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

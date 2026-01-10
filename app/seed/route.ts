import 'server-only';

import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { users, customers, invoices, revenue } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    // Enable UUIDs
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Drop tables (DEV ONLY)
    await sql`DROP TABLE IF EXISTS invoices`;
    await sql`DROP TABLE IF EXISTS customers`;
    await sql`DROP TABLE IF EXISTS revenue`;
    await sql`DROP TABLE IF EXISTS users`;

    // Users
    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    for (const user of users) {
      const hashed = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashed});
      `;
    }

    // Customers
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
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url});
      `;
    }

    // Invoices
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
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date});
      `;
    }

    // Revenue
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

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('SEED ERROR:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

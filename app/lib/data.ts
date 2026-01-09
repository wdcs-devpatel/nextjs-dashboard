import postgres from 'postgres';
import { unstable_noStore as noStore } from 'next/cache';

import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';

import { formatCurrency } from './utils';

/* ================================
   IMPORTANT: LOCAL NEON FIX
================================ */

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED is not defined');
}

const sql = postgres(process.env.DATABASE_URL_UNPOOLED, {
  ssl: 'require',
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
});

/* ================================
   DASHBOARD DATA
================================ */

export async function fetchRevenue() {
  noStore(); // Prevent static caching
  try {
    return await sql<Revenue[]>`
      SELECT month, revenue
      FROM revenue
      ORDER BY month;
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT
        invoices.id,
        invoices.amount,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5;
    `;
    return data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    // Parallelize queries for better performance
    const [invoiceCount, customerCount, invoiceStatus] =
      await Promise.all([
        sql`SELECT COUNT(*) FROM invoices`,
        sql`SELECT COUNT(*) FROM customers`,
        sql`
          SELECT
            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
          FROM invoices;
        `,
      ]);

    return {
      numberOfInvoices: Number(invoiceCount[0].count),
      numberOfCustomers: Number(customerCount[0].count),
      totalPaidInvoices: formatCurrency(invoiceStatus[0].paid ?? 0),
      totalPendingInvoices: formatCurrency(invoiceStatus[0].pending ?? 0),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

/* ================================
   INVOICES
================================ */

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // ILIKE ensures case-insensitive search
    return await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset};
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore();
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`};
    `;
    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore();
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT id, customer_id, amount, status
      FROM invoices
      WHERE id = ${id};
    `;
    if (!data[0]) return null;
    // Database stores amount in cents; convert to dollars for the UI
    return { ...data[0], amount: data[0].amount / 100 };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

/* ================================
   CUSTOMERS
================================ */

export async function fetchCustomers() {
  noStore();
  try {
    return await sql<CustomerField[]>`
      SELECT id, name FROM customers ORDER BY name ASC;
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore();
  try {
    const data = await sql<CustomersTableType[]>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC;
    `;
    return data.map((c) => ({
      ...c,
      total_pending: formatCurrency(c.total_pending),
      total_paid: formatCurrency(c.total_paid),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer table.');
  }
}
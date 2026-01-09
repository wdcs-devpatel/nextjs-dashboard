import postgres from 'postgres';

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED is missing');
}

const sql = postgres(process.env.DATABASE_URL_UNPOOLED, {
  ssl: 'require',
  max: 1,
  connect_timeout: 15,
});

export async function GET() {
  try {
    const data = await sql`
      SELECT invoices.amount, customers.name
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      LIMIT 5;
    `;

    return Response.json(data);
  } catch (error) {
    console.error('QUERY ERROR:', error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

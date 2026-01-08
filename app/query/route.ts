import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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

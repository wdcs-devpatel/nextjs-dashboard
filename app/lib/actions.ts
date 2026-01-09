'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.DATABASE_URL_UNPOOLED!, {
  ssl: 'require',
  max: 1,
});

export async function deleteInvoice(formData: FormData) {
  const id = formData.get('id') as string;

  await sql`DELETE FROM invoices WHERE id = ${id}`;

  revalidatePath('/dashboard/invoices');
}

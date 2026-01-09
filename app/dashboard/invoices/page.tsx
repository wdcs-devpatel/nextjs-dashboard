import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import InvoicesTable from '@/app/ui/invoices/table';
import Pagination from '@/app/ui/invoices/pagination';
import { fetchInvoicesPages } from '@/app/lib/data';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const query = searchParams?.query ?? '';
  const currentPage = Number(searchParams?.page ?? '1');

  const totalPages = await fetchInvoicesPages(query);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label: 'Invoices',
            href: '/dashboard/invoices',
            active: true,
          },
        ]}
      />

      <InvoicesTable query={query} currentPage={currentPage} />
      <Pagination totalPages={totalPages} />
    </main>
  );
}

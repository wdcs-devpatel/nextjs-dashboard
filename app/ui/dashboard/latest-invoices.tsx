import clsx from 'clsx';
import Image from 'next/image';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { LatestInvoice } from '@/app/lib/definitions';

export default function LatestInvoices({
  latestInvoices,
}: {
  latestInvoices: LatestInvoice[];
}) {
  return (
    <div className="flex flex-col md:col-span-2">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Invoices
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="bg-white rounded-md divide-y">
          {latestInvoices.map((invoice, i) => (
            <div
              key={invoice.id}
              className={clsx(
                'flex items-center justify-between p-4',
                i !== 0 && 'border-t',
              )}
            >
              <div className="flex items-center">
                <Image
                  src={invoice.image_url}
                  alt={invoice.name}
                  width={32}
                  height={32}
                  className="rounded-full mr-4"
                />
                <div>
                  <p className="text-sm font-semibold">{invoice.name}</p>
                  <p className="text-sm text-gray-500">{invoice.email}</p>
                </div>
              </div>

              <p className={`${lusitana.className} text-sm font-medium`}>
                {invoice.amount}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center pt-6 text-gray-500">
          <ArrowPathIcon className="h-5 w-5" />
          <span className="ml-2 text-sm">Updated just now</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentDuplicateIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] items-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
                'bg-gray-50': pathname !== link.href,
              }
            )}
          >
            <Icon className="w-6" />
            <span className="hidden md:block">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

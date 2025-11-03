'use client';

import { SessionManager } from '@/components/SessionManager';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Routes publiques qui ne nécessitent pas de session
  const publicRoutes = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  // Ne pas wrapper avec SessionManager pour les routes publiques
  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <SessionManager>
      {children}
    </SessionManager>
  );
}

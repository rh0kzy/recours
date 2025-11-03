import { SessionManager } from '@/components/SessionManager';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionManager>
      {children}
    </SessionManager>
  );
}

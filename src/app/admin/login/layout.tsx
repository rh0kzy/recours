import { SessionManager } from '@/components/SessionManager';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionManager disabled>
      {children}
    </SessionManager>
  );
}


import { Suspense } from 'react';
import PageTitle from '@/components/shared/PageTitle';
import LoginPageClient from './LoginPageClient';
import { Skeleton } from '@/components/ui/skeleton';

const LoginPageSkeleton = () => (
  <div className="flex justify-center py-12">
    <div className="w-full max-w-md space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
    </div>
  </div>
);


export default function LoginPage() {
  return (
    <>
      <PageTitle title="Acceso de Administrador" subtitle="Iniciar Sesión" />
      <Suspense fallback={<LoginPageSkeleton />}>
        <LoginPageClient />
      </Suspense>
    </>
  );
}

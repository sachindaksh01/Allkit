import dynamic from 'next/dynamic';

const OrganizePDFPage = dynamic(() => import('@/components/pdf/OrganizePDFPage'), { ssr: false });

export default function Page() {
  return <OrganizePDFPage />;
} 
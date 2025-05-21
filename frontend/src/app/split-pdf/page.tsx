import dynamic from 'next/dynamic';

const SplitPDFPage = dynamic(() => import('@/components/pdf/SplitPDFPage'), { ssr: false });

export default function Page() {
  return <SplitPDFPage />;
} 
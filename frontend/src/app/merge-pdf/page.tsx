import dynamic from 'next/dynamic';

const MergePDFPage = dynamic(() => import('@/components/pdf/MergePDFPage'), { ssr: false });

export default function Page() {
  return <MergePDFPage />;
} 
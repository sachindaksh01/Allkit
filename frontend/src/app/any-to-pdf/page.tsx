'use client';

import dynamic from 'next/dynamic';

const AnyToPDF = dynamic(() => import('@/components/pdf/AnyToPDF'), {
  ssr: false
});

export default function AnyToPDFPage() {
  return <AnyToPDF />;
} 
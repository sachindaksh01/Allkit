import dynamic from 'next/dynamic';
const PDFMergePage = dynamic(() => import('./PDFMergeClient'), { ssr: false });
export default PDFMergePage; 
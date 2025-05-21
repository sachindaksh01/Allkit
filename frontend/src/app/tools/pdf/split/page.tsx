import dynamic from 'next/dynamic';
const PDFSplitPage = dynamic(() => import('./PDFSplitClient'), { ssr: false });
export default PDFSplitPage; 
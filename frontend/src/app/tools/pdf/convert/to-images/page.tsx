import dynamic from 'next/dynamic';
const PDFToImagesPage = dynamic(() => import('./PDFToImagesClient'), { ssr: false });
export default PDFToImagesPage; 
import { Router } from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/organize', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { pageOrder } = req.body;
    if (!pageOrder) {
      return res.status(400).json({ error: 'Page order not provided' });
    }

    const pageOrderArray = JSON.parse(pageOrder);
    const mergedPdf = await PDFDocument.create();

    for (const pageInfo of pageOrderArray) {
      const file = req.files.find(f => f.originalname === pageInfo.fileName);
      if (!file) {
        return res.status(400).json({ error: `File not found: ${pageInfo.fileName}` });
      }

      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      if (pageInfo.isBlank) {
        const blankPage = mergedPdf.addPage();
        blankPage.setSize(pdf.getPage(0).getSize());
      } else {
        const [copiedPage] = await mergedPdf.copyPages(pdf, [pageInfo.pageNumber - 1]);
        mergedPdf.addPage(copiedPage);
      }
    }

    const outputPath = path.join('uploads', `${uuidv4()}.pdf`);
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    // Clean up uploaded files
    for (const file of req.files) {
      fs.unlinkSync(file.path);
    }

    res.download(outputPath, 'organized.pdf', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up the output file
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error organizing PDF:', error);
    res.status(500).json({ error: 'Error organizing PDF' });
  }
});

export default router; 
 
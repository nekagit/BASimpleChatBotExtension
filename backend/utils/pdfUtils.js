import axios from "axios";
import pdfParsePages from "pdf-parse-pages";
import tabula from "tabula-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Disable debug mode for pdf-parse-pages (if applicable)
pdfParsePages.isDebugMode = false;

export async function downloadAndParsePDF(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const pdfBuffer = response.data;

    // Parse PDF pages
    const pdfData = await pdfParsePages(pdfBuffer);
    console.log(pdfData.text)
    const text = pdfData.text
    // Save the PDF temporarily to use with tabula-js
    const tempPdfPath = path.join(__dirname, "temp.pdf");
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Parse tables
    const tables = await new Promise((resolve, reject) => {
      tabula(tempPdfPath, { pages: "all" }).extractCsv((err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    // Remove temporary PDF file
    fs.unlinkSync(tempPdfPath);

    return { text, tables };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`File not found: ${error.path}`);
    } else {
      console.error(`Error downloading/parsing PDF: ${url}`, error);
    }
    throw error;
  }
}

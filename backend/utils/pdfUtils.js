import axios from "axios";
import pdfParse from 'pdf-parse';

export async function parsePDF(url) {
  try {
    // Download the PDF
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data);

    // Parse the PDF
    const data = await pdfParse(pdfBuffer);

    // Extract text
    const text = data.text;

    // Extract tables (simplified approach)
    const tables = extractTables(text);

    return { text, tables };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}

function extractTables(text) {
  // This is a very simplified approach to detect tables
  // You may need a more sophisticated method depending on your PDF structure
  const tables = [];
  const lines = text.split('\n');
  let currentTable = [];
  let isInTable = false;

  lines.forEach(line => {
    if (line.includes('|') || line.includes('\t')) {
      if (!isInTable) {
        currentTable = [];
        isInTable = true;
      }
      currentTable.push(line.split(/[|\t]/).map(cell => cell.trim()));
    } else if (isInTable) {
      tables.push(currentTable);
      currentTable = [];
      isInTable = false;
    }
  });

  if (isInTable) {
    tables.push(currentTable);
  }

  return tables;
}
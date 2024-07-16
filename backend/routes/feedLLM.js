import express from "express";
import { downloadAndParsePDF } from "../utils/pdfUtils.js";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { pdfs } = req.body;

  if (!Array.isArray(pdfs) || pdfs.length === 0) {
    return res.status(400).send("PDFs array is required and must not be empty.");
  }

  try {
    const parsedData = await Promise.all(pdfs.map(downloadAndParsePDF));
    const combinedText = parsedData.map(data => data.text).join("\n");
    const allTables = parsedData.flatMap(data => data.tables);

    // Combine text and table data
    const combinedData = `
      Text content:
      ${combinedText}

      Table data:
      ${allTables.join("\n\n")}
    `;

    // Feed the combined data to the LLM
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: combinedData,
        stream: true,
      }),
    });

    const data = await response.json();
    res.json({ message: "PDFs and tables fed to LLM successfully.", data });
  } catch (error) {
    console.error("Error feeding PDFs to LLM:", error);
    res.status(500).send("An error occurred while feeding PDFs to LLM.");
  }
});

export default router;
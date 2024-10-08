import express from "express";
import { parsePDF } from "../utils/pdfUtils.js";
import fetch from "node-fetch";
import { queryLocalLLM } from "../utils/llmUtils.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const { pdfs } = req.body;

  if (!Array.isArray(pdfs) || pdfs.length === 0) {
    return res
      .status(400)
      .send("PDFs array is required and must not be empty.");
  }

  try {
    const parsedData = await Promise.all(pdfs.map(parsePDF));
    const combinedText = parsedData.map((data) => data.text).join("\n");
    const allTables = parsedData.flatMap((data) => data.tables);

    // Combine text and table data
    const combinedData = `
      (What is this following text about?)
      ${combinedText}

      `;
      // Table data:
      // ${allTables.join("\n\n")}
    console.log("response incomming");
    // console.log(allTables);
    // Feed the combined data to the LLM
    const response = await queryLocalLLM(combinedData)
    console.log(response);
    const responseQuestion = await queryLocalLLM("What is my PDF i gave u last about?")
    console.log(responseQuestion)
    res.json({ message: "PDFs and tables fed to LLM successfully.", responseQuestion });
  } catch (error) {
    console.error("Error feeding PDFs to LLM:", error);
    res.status(500).send("An error occurred while feeding PDFs to LLM.");
  }
});

export default router;

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors"

const corsOptions = {
  // origin: 'chrome-extension://lpnlefhbcibnafkocpgmaogpgpfemmjh',
   origin: true,
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors(corsOptions));

async function queryLocalLLM(question) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      prompt: question,
      stream: true,
    }),
  });

  let fullResponse = "";
  const text = await response.text();
  const lines = text.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    try {
      const parsedLine = JSON.parse(line);
      fullResponse += parsedLine.response;

      if (parsedLine.done) {
        return fullResponse.trim();
      }
    } catch (error) {
      console.error("Error parsing line:", error);
    }
  }

  return fullResponse.trim();
}

app.post("/query", async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.status(400).send("Question is required");
  }
  try {
    console.log("try");

    const answer = await queryLocalLLM(question);
    console.log(answer);

    res.json({ answer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

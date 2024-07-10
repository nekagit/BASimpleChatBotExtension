import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

async function queryLocalLLM(question) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama3",
      prompt: question,
    }),
  });

  const data = await response.json();
  return data.response;
}

app.post('/query', async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.status(400).send('Question is required');
  }
  try {
    const answer = await queryLocalLLM(question);
    res.json({ answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
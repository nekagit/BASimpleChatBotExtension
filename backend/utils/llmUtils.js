import fetch from "node-fetch";

export async function queryLocalLLM(question) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      prompt: question + " (Please respond in 3 sentences or less.)",
      stream: true,
    }),
  });

  let fullResponse = "";
  let sentenceCount = 0;
  const text = await response.text();
  const lines = text.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    try {
      const parsedLine = JSON.parse(line);
      const newText = parsedLine.response;
      
      // Count sentences in the new text
      const newSentences = newText.match(/[.!?]+/g) || [];
      sentenceCount += newSentences.length;

      if (sentenceCount <= 3) {
        fullResponse += newText;
      } else {
        // If we've exceeded 3 sentences, trim the excess
        const sentences = fullResponse.match(/[^.!?]+[.!?]+/g) || [];
        fullResponse = sentences.slice(0, 3).join('');
        break;
      }

      if (parsedLine.done || sentenceCount >= 3) {
        return fullResponse.trim();
      }
    } catch (error) {
      console.error("Error parsing line:", error);
    }
  }

  return fullResponse.trim();
}

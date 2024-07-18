import fetch from "node-fetch";

// docker run -v C:\Users\Nenad\Desktop\git\BA\simpleChat\backend:/app rasa/rasa init --no-prompt
// docker run -v C:\Users\Nenad\Desktop\git\BA\simpleChat\backend:/app -p 5005:5005 rasa/rasa run --enable-api --cors "*" --debug
  // Request to Rasa
  // const responseR = await fetch("http://localhost:5005/webhooks/rest/webhook", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     sender: "test_user",
  //     message: question,
  //   }),
  // });

export async function queryLocalLLM(question) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      prompt: question  + " (Please respond in 3 sentences or less.)",
      stream: true,
    }),
  });

  // Log the raw response
  const rawText = await response.text();
  console.log("Raw response text:", rawText);

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    throw new Error("Failed to parse response from Rasa");
  }

  // Check if the response is empty
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Empty response from Rasa:", data);
    return "No response from the model.";
  }

  let fullResponse = "";
  let sentenceCount = 0;

  for (const entry of data) {
    if (entry.text) { // Check if 'text' property exists
      const newText = entry.text;

      // Count sentences in the new text
      const newSentences = newText.match(/[.!?]+/g) || [];
      sentenceCount += newSentences.length;

      if (sentenceCount <= 3) {
        fullResponse += newText;
      } else {
        // If we've exceeded 3 sentences, trim the excess
        const sentences = fullResponse.match(/[^.!?]+[.!?]+/g) || [];
        fullResponse = sentences.slice(0, 3).join("");
        break;
      }

      if (sentenceCount >= 3) {
        break;
      }
    }
  }

  return fullResponse.trim();
}

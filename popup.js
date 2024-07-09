document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const questionInput = document.getElementById('question');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const askQuestionButton = document.getElementById('ask-question');

  // Load saved API key from localStorage
  apiKeyInput.value = localStorage.getItem('openai-api-key') || '';

  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    if (apiKey) {
      localStorage.setItem('openai-api-key', apiKey);
      alert('API key saved');
    } else {
      alert('Please enter a valid API key');
    }
  });

  askQuestionButton.addEventListener('click', async () => {
    const apiKey = localStorage.getItem('openai-api-key');
    const question = questionInput.value;

    if (!apiKey) {
      alert('API key is not set');
      return;
    }
    if (!question) {
      alert('Please enter a question');
      return;
    }

    // Make a request to OpenAI
    try {
      const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: question,
          max_tokens: 150,
        }),
      });

      const data = await response.json();
      console.log(data);
      alert(data.choices[0].text);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  });
});

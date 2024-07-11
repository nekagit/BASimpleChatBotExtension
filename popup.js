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
    const question = questionInput.value;

    if (!question) {
      alert('Please enter a question');
      return;
    }

    // Make a request to OpenAI
    try {
       const response = await fetch('http://localhost:3000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
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

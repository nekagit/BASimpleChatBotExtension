document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const questionInput = document.getElementById('question');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const askQuestionButton = document.getElementById('ask-question');
  const responseBox = document.getElementById('response-box');

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
      responseBox.textContent = data.answer;
      responseBox.style.display = 'block';
      console.log('Response received:', data.answer);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleApiInputCheckbox = document.getElementById('toggle-api-input');
  const apiKeyInputDiv = document.getElementById('api-key-input');

  toggleApiInputCheckbox.addEventListener('change', () => {
    if (toggleApiInputCheckbox.checked) {
      apiKeyInputDiv.style.display = 'flex';
      apiKeyInputDiv.style.opacity = 1;
    } else {
      apiKeyInputDiv.style.display = 'none';
      apiKeyInputDiv.style.opacity = 0;
    }
  });
});

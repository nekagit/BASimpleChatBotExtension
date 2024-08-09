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
    const apiKey = localStorage.getItem('openai-api-key');

    if (!question) {
      alert('Please enter a question');
      return;
    }

    if (!apiKey) {
      alert('Please save an OpenAI API key first');
      return;
    }

    // Make a request to OpenAI
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: "You are a helpful assistant."},
            {role: "user", content: question}
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices[0].message.content;
      responseBox.textContent = answer;
      responseBox.style.display = 'block';
      console.log('Response received:', answer);
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
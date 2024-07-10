chrome.commands.onCommand.addListener((command) => {
  if (command === "open_input_box") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: createInputBox
      });
    });
  }
});

function createInputBox() {
  const inputContainer = document.createElement("div");
  const input = document.createElement("input");

  // Style for input container
  inputContainer.style.position = "fixed";
  inputContainer.style.top = "50%";
  inputContainer.style.left = "50%";
  inputContainer.style.transform = "translate(-50%, -50%)";
  inputContainer.style.zIndex = "10000";
  inputContainer.style.backgroundColor = "black";
  inputContainer.style.border = "1px solid gray";
  inputContainer.style.borderRadius = "5px";
  inputContainer.style.display = "flex";
  inputContainer.style.justifyContent = "center";
  inputContainer.style.alignItems = "center";

  // Style for input
  input.type = "text";
  input.placeholder = "Ask a question";
  input.style.flexGrow = "1";
  input.style.backgroundColor = "black";
  input.style.color = "white";
  input.style.border = "1px solid gray";
  input.style.borderRadius = "3px";
  input.style.fontSize = "16px";

  inputContainer.appendChild(input);
  document.body.appendChild(inputContainer);
  input.focus();

   const handleInputSubmit = async () => {
    const question = input.value;
    if (!question) {
      alert('Please enter a question');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      alert(data.answer);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  };


  // Handle Enter key press in the input field
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleInputSubmit();
    }
  });

  // Remove the input box when it loses focus
  input.onblur = function () {
    document.body.removeChild(inputContainer);
  };
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_input_box") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: createInputBox,
      });
    });
  }
});

function createInputBox() {
  const inputContainer = document.createElement("div");
  const input = document.createElement("input");
  const responseBox = document.createElement("div");

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
  inputContainer.style.flexDirection = "column";
  inputContainer.style.alignItems = "center";
  inputContainer.style.padding = "10px";
  inputContainer.style.width = "300px";

  // Style for response box
  responseBox.style.position = "relative";
  responseBox.style.boxSizing = "border-box";
  responseBox.style.width = "100%";
  responseBox.style.marginBottom = "10px";
  responseBox.style.padding = "10px";
  responseBox.style.backgroundColor = "#222";
  responseBox.style.border = "1px solid gray";
  responseBox.style.borderRadius = "3px";
  responseBox.style.color = "white";
  responseBox.style.fontSize = "16px";
  responseBox.style.display = "none"; // Hidden initially
  responseBox.style.zIndex = "10001"; // Higher than the container
  // Style for input
  input.type = "text";
  input.placeholder = "Ask a question";
  input.style.width = "100%";
  input.style.padding = "10px";
  input.style.backgroundColor = "black";
  input.style.color = "white";
  input.style.border = "1px solid gray";
  input.style.borderRadius = "3px";
  input.style.fontSize = "16px";

  inputContainer.appendChild(responseBox);
  inputContainer.appendChild(input);
  document.body.appendChild(inputContainer);
  input.focus();

  const handleInputSubmit = async () => {
    const question = input.value;
    if (!question) {
      alert("Please enter a question");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      responseBox.textContent = data.answer;
      responseBox.style.display = "block !important";
      responseBox.offsetHeight; // Force layout update

      console.log("Response box should now be visible");
      console.log("Response box content:", responseBox.textContent); // Debug log
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    }
  };

  // Handle Enter key press in the input field
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleInputSubmit();
    }
  });

  // Do not remove the input box when it loses focus
  input.onblur = function () {
    // No operation to keep the input box
  };
}

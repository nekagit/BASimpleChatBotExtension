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
  const input = document.createElement("input");
  input.type = "text";
  input.style.position = "fixed";
  input.style.top = "50%";
  input.style.left = "50%";
  input.style.transform = "translate(-50%, -50%)";
  input.style.zIndex = "10000";
  input.style.padding = "10px";
  input.style.fontSize = "16px";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "4px";
  input.style.backgroundColor = "black";
  document.body.appendChild(input);
  input.focus();

  // Remove the input box when it loses focus
  input.onblur = function () {
    document.body.removeChild(input);
  };
}

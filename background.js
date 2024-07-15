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
//////////////

let inputBoxDisplayed = false;
let responseBoxDisplayed = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated.");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started.");
});

function findPDFs() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const pdfLinks = Array.from(
              document.querySelectorAll('a[href$=".pdf"]')
            ).map((link) => ({
              url: link.href,
              name: link.innerText.trim() || link.href,
            }));
            return pdfLinks;
          },
        },
        (results) => {
          resolve(
            results && results[0] && results[0].result ? results[0].result : []
          );
        }
      );
    });
  });
}

chrome.commands.onCommand.addListener(async (command) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0].id;

  if (command === "open_input_box") {
    if (inputBoxDisplayed) {
      chrome.tabs.sendMessage(tabId, { action: "removeInputBox" });
      inputBoxDisplayed = false;
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: createInputBox,
      });
      inputBoxDisplayed = true;
    }
  } else if (command === "show_pdf_list") {
    const pdfLinks = await findPDFs();
    if (responseBoxDisplayed) {
      chrome.tabs.sendMessage(tabId, { action: "removeResponseBox" });
      responseBoxDisplayed = false;
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: showPDFList,
        args: [pdfLinks],
      });
      responseBoxDisplayed = true;
    }
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
  responseBox.style.boxSizing = "border-box";
  responseBox.style.width = "100%";
  responseBox.style.marginBottom = "10px";
  responseBox.style.padding = "10px";
  responseBox.style.backgroundColor = "#222";
  responseBox.style.border = "1px solid gray";
  responseBox.style.borderRadius = "3px";
  responseBox.style.color = "white";
  responseBox.style.fontSize = "16px";
  responseBox.style.display = "none";
  responseBox.style.maxHeight = "200px"; // Set  max height
  responseBox.style.overflowY = "auto"; // Add scrolling if content is too long

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
      console.log("Response received:", data.answer);
      responseBox.textContent = data.answer;
      responseBox.style.display = "block";
      console.log("Response box should now be visible");
      console.log("Response box content:", responseBox.textContent);
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

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "removeInputBox") {
      inputContainer.remove();
    }
  });
}
function showPDFList(pdfLinks) {
  const responseBox = document.createElement("div");
  responseBox.id = "extension-response-box";

  // Style for response box
  responseBox.style.position = "fixed";
  responseBox.style.top = "50%";
  responseBox.style.left = "50%";
  responseBox.style.transform = "translate(-50%, -50%)";
  responseBox.style.zIndex = "10000";
  responseBox.style.boxSizing = "border-box";
  responseBox.style.width = "500px";
  responseBox.style.padding = "20px";
  responseBox.style.backgroundColor = "#222";
  responseBox.style.border = "1px solid gray";
  responseBox.style.borderRadius = "5px";
  responseBox.style.color = "white";
  responseBox.style.fontSize = "16px";
  responseBox.style.maxHeight = "400px";
  responseBox.style.overflowY = "auto";

  if (pdfLinks.length > 0) {
    responseBox.innerHTML = `
    <div style="display: flex; flex-direction: row;justify-content: space-around;align-items:center; margin-bottom: 16px;">
      <strong>Available PDFs:</strong>
       <button id="feedButton" style="padding: 8px 16px; margin-top: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Feed PDFs to LLM</button>
      </div>
       <br>
      ${pdfLinks
        .map(
          (link) => `
        <div style="display: flex; align-items: center;">
          <input type="checkbox" id="pdfCheckbox-${link.url}" value="${link.url}">
          <label for="pdfCheckbox-${link.url}" style="margin-left: 8px;">
            <a href="#" style="color: #add8e6; cursor: pointer;" onclick="openPDF(event, '${link.url}');">${link.name}</a>
          </label>
        </div>
      `
        )
        .join("<br>")}
    `;

    // Button click event to handle feeding PDFs to LLM
    const feedButton = responseBox.querySelector("#feedButton");
    feedButton.addEventListener("click", async () => {
      const selectedPDFs = [];
      pdfLinks.forEach((link) => {
        const checkbox = document.getElementById(`pdfCheckbox-${link.url}`);
        if (checkbox.checked) {
          selectedPDFs.push(link.url);
        }
      });

      if (selectedPDFs.length === 0) {
        alert("Please select at least one PDF to feed to LLM.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/feed_llm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pdfs: selectedPDFs }),
        });

        const data = await response.json();
        console.log("LLM feeding response:", data);
        alert("PDFs fed to LLM successfully.");
      } catch (error) {
        console.error("Error feeding PDFs to LLM:", error);
        alert("An error occurred while feeding PDFs to LLM.");
      }
    });
  } else {
    responseBox.textContent = "No PDF links found on the page.";
  }

  document.body.appendChild(responseBox);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "removeResponseBox") {
      responseBox.remove();
    }
  });
}
// Function to open PDF link in a new tab
function openPDF(event, url) {
  event.preventDefault();
  chrome.tabs.create({ url, active: true }); // Open the URL in a new tab
}

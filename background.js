import { createInputBox, findPDFs, showPDFList } from './content.js';

let inputBoxDisplayed = false;
let responseBoxDisplayed = false;

//////////////

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

// Function to open PDF link in a new tab
function openPDF(event, url) { 
  event.preventDefault();
  chrome.tabs.create({ url, active: true }); // Open the URL in a new tab
}
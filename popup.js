document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup loaded!");
    
    const startButton = document.getElementById("start-delete");
    if (startButton) {
      startButton.addEventListener("click", () => {
        console.log("Start Deleting clicked");
        browser.runtime.sendMessage({ action: "deleteTweets" });
      });
    } else {
      console.error("Start button not found!");
    }
  });
  
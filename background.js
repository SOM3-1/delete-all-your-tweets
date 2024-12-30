browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "deleteTweets") {
      console.log("Injecting content.js into the active tab...");
  
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
          browser.tabs.executeScript(activeTab.id, { file: "content.js" });
        } else {
          console.error("No active tab found!");
        }
      }).catch((error) => {
        console.error("Error querying active tabs:", error);
      });
    }
  });
  
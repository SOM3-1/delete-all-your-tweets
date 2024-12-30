console.log("Content script loaded!");

const processTweet = async (tweet) => {
  try {
    console.log("Processing a tweet...");

    const moreButton = tweet.querySelector('button[data-testid="caret"]');
    if (!moreButton) {
      console.warn("More button not found for this tweet.");
      return false; 
    }

    console.log("Clicking the 'More' button...");
    moreButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const deleteOption = Array.from(
      document.querySelectorAll('div[role="menuitem"]')
    ).find((item) => item.textContent.includes("Delete"));

    if (!deleteOption) {
      console.warn("Delete option not found in dropdown.");
      return false; 
    }

    console.log("Clicking the 'Delete' option...");
    deleteOption.click();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const confirmButton = Array.from(
      document.querySelectorAll('div[role="button"]')
    ).find((item) => item.textContent.includes("Delete"));

    if (!confirmButton) {
      console.warn("Confirmation button not found. Skipping this tweet.");
      return false; 
    }

    console.log("Clicking the 'Confirm Delete' button...");
    confirmButton.click();
    console.log("Tweet deleted.");
    await new Promise((resolve) => setTimeout(resolve, 3000)); 

    return true;
  } catch (error) {
    console.error("Error processing tweet:", error);
    return false;
  }
};

const deleteTweetsOneByOne = async () => {
  console.log("Starting to delete tweets one by one...");

  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  if (tweets.length === 0) {
    console.error("No tweets found. Ensure you're on your profile page.");
    return;
  }

  for (const tweet of tweets) {
    const success = await processTweet(tweet);
    if (!success) {
      console.warn("Moving to the next tweet...");
    }
  }

  console.log("Finished processing tweets.");
};

const observer = new MutationObserver(() => {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  if (tweets.length > 0) {
    console.log("Tweets detected. Starting deletion process...");
    observer.disconnect();
    deleteTweetsOneByOne();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

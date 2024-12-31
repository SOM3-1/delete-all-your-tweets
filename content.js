console.log("Content script loaded!");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getOwnerUsernameFromURL = () => {
  const currentUrl = window.location.href;
  const match = currentUrl.match(/x\.com\/([^/]+)/);
  return match ? match[1] : null;
};

const isOwnTweet = (tweet) => {
  const ownerUsername = getOwnerUsernameFromURL();
  const usernameElement = tweet.querySelector('a[role="link"] > div > span');
  if (usernameElement && ownerUsername) {
    const tweetUsername = usernameElement.innerText.replace('@', '').trim();

    const ownerUsernameCleaned = ownerUsername.replace('@', '').trim();

    return tweetUsername === ownerUsernameCleaned;
  }
  return false;
};

const processTweet = async (tweet) => {
  try {
    console.log("Processing a tweet...");
    const currentUrl = window.location.href;

    if (currentUrl.includes("/likes")) {
      const unlikeButton = tweet.querySelector('button[data-testid="unlike"]');
      if (unlikeButton) {
        console.log("Unlike button found. Clicking...");
        unlikeButton.click();
        console.log("Tweet unliked.");
        await wait(10);
        return true;
      } else {
        console.warn("Unlike button not found for this tweet. Skipping...");
        return false;
      }
    }

    if (currentUrl.includes("/with_replies")) {
      const unlikeButton = tweet.querySelector('button[data-testid="unlike"]');
      if (unlikeButton) {
        console.log("Unlike button found. Clicking...");
        unlikeButton.click();
        console.log("Tweet unliked.");
        await wait(1000);
      }
      return await deleteTweet(tweet);
    }

    const undoRetweetButton = tweet.querySelector('button[data-testid="unretweet"]');
    if (undoRetweetButton) {
      console.log("Undo retweet button found. Clicking...");
      undoRetweetButton.click();
      await wait(1000);

      const confirmUndoRetweet = document.querySelector('div[data-testid="unretweetConfirm"]');
      if (confirmUndoRetweet) {
        console.log("Confirming undo retweet...");
        confirmUndoRetweet.click();
        console.log("Undo retweet successful.");
        await wait(2000);
        return true;
      } else {
        console.warn("Confirmation for undo retweet not found. Skipping...");
        return false;
      }
    }

    return await deleteTweet(tweet);

  } catch (error) {
    console.error("Error processing tweet:", error);
    return false;
  }
};

const deleteTweet = async (tweet) => {
  try {
    if (!isOwnTweet(tweet)) {
      console.warn("This is not your tweet. Skipping...");
      return false;
    }
    const moreButton = tweet.querySelector('button[data-testid="caret"]');
    if (!moreButton) {
      console.warn("More button not found for this tweet. Skipping...");
      return false;
    }

    console.log("Clicking the 'More' button...");
    moreButton.click();
    await wait(1000);

    const deleteOption = Array.from(
      document.querySelectorAll('div[role="menuitem"]')
    ).find((item) => item.textContent.includes("Delete"));

    if (!deleteOption) {
      console.warn("Delete option not found in dropdown. Skipping...");
      return false;
    }

    console.log("Clicking the 'Delete' option...");
    deleteOption.click();
    await wait(1000);

    const confirmButton = document.querySelector('button[data-testid="confirmationSheetConfirm"]');
    if (!confirmButton) {
      console.warn("Confirmation button not found. Skipping...");
      return false;
    }

    console.log("Clicking the 'Confirm Delete' button...");
    confirmButton.click();
    console.log("Tweet deleted.");
    await wait(3000);

    return true;
  } catch (error) {
    console.error("Error deleting tweet:", error);
    return false;
  }
};

const deleteTweetsSequentially = async () => {
  console.log("Starting tweet deletion process...");

  while (true) {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');

    if (tweets.length === 0) {
      console.log("No tweets found. Scrolling down...");
      window.scrollBy(0, 2 * window.innerHeight);
      await wait(2000);
      const moreTweets = document.querySelectorAll('article[data-testid="tweet"]');
      if (moreTweets.length === 0) {
        console.log("No more tweets to process. Exiting...");
        break;
      }
      continue;
    }

    for (const tweet of tweets) {
      const success = await processTweet(tweet);
      if (!success) {
        console.warn("Moving to the next tweet...");
      }
    }

    console.log("Finished current batch. Scrolling down for more tweets...");
    window.scrollBy(0,2*  window.innerHeight);
    await wait(2000);
  }

  console.log("Finished processing all tweets.");
};

deleteTweetsSequentially();

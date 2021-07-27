chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        name:"Jack"
    });
});

chrome.storage.local.get("name", data => {

});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === "complete" && tab.url === "https://app.cryptoblades.io/#/combat") {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["./foreground.js"]
        })
        .then(() => {
            console.log("injected")
        })
        .catch(err => console.log(err))
    }
})
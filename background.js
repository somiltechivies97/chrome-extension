chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ medicineData: [], startFetching: false, stopFetching: false });
});



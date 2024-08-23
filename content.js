chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchMedicines") {
        const allChips = document.querySelector('.style__chips___2T95q').children;
        console.log('allChips: ', allChips);
        const totalPages = document.querySelector('.list-pagination').children.length;
        console.log('totalPages: ', totalPages);

        sendResponse({ allChips: allChips, totalPages: totalPages });
    }
});
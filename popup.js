document.addEventListener('DOMContentLoaded', async function() {
  await displayMedicines(true);
});

document.getElementById('fetch-medicines-btn').addEventListener('click', function() {
  chrome.storage.local.set({ startFetching: false });
  chrome.storage.local.set({ stopFetching: false });

  chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: fetchAllMedicines
    }, (results) => {
      if (results && results.length > 0) {
        if (results[0].result === false) {
          const medicineList = document.getElementById('medicine-list');
          if (!medicineList.hasChildNodes()) {
            const li = document.createElement('li');
            li.className = 'error-msg';
            li.innerHTML = `This extension works only on www.1mg.com`;
            li.style.color = 'red';
            medicineList.appendChild(li);
          }
        }
      }
    });
  });  
});

document.getElementById('stop-fetching-btn').addEventListener('click', () => {
  chrome.storage.local.set({ startFetching: false });
  chrome.storage.local.set({ stopFetching: true });
  this.setStatus(null, true);
  document.getElementById('clear-storage-btn').style.display = 'block';
  document.getElementById('stop-fetching-btn').style.display = 'none';
  document.getElementById('fetch-loader-btn').style.display = 'none';
  document.getElementById('fetch-medicines-btn').disabled = false;
});

document.getElementById('clear-storage-btn').addEventListener('click', () => {
  chrome.storage.local.remove(['medicineData', 'startFetching', 'stopFetching'], () => {
    this.setStatus('Data cleared.', true);
    document.getElementById('clear-storage-btn').style.display = 'none';
    document.getElementById('medicine-list').innerHTML = '';
  });
});

chrome.runtime.onMessage.addListener(async function(message) {
  if (message.type === 'fetchStatus') {
    this.setStatus(message.data);
    await displayMedicines();
  }
  if (message.type === 'fetchStartFlag') {
    chrome.storage.local.set({ startFetching: message.data });

    updateFetchingUI(message.data);
  }
});


function fetchAllMedicines() {
  const allChips = document.querySelector('.style__chips___2T95q')?.children;
  let currentChip = 'a';
  let currentPage = 1;
  let currentChipIndex = 0;

  const url = new URL(window.location.href);
  currentPage = url.searchParams.get('page') || 1;
  currentChip = url.searchParams.get('label') || 'a';

  for (let key in allChips) {
    if (allChips[key].innerText.toLowerCase() === currentChip.toLowerCase()) {
      currentChipIndex = key;
      break;
    }
  }

  async function fetchNextPage() {
    const fetchingState = await getFetchingStateFlag();
    if (fetchingState) return;

    const nextBtn = document.querySelector('.list-pagination .next');
    if (nextBtn && !nextBtn.classList.contains('link-disabled')) {
      const medicines = extractMedicines();
      await saveMedicinesToStorage(medicines);

      chrome.runtime.sendMessage({ type: 'fetchStatus', data: `Fetched page ${currentPage} for alphabet ${currentChip.toUpperCase()}` });

      nextBtn.querySelector('a').click();
      currentPage++;
      setTimeout(fetchNextPage, 4000);
    } else {
      fetchNextAlphabet();
    }
  }

  async function fetchNextAlphabet() {
    const fetchingState = await getFetchingStateFlag();
    if (fetchingState) return;
    
    currentPage = 1;
    currentChipIndex++;
    currentChip = allChips[currentChipIndex].innerText.toLowerCase();

    if (currentChipIndex < allChips.length) {
      allChips[currentChipIndex].click();
      setTimeout(fetchNextPage, 4000);
    } else {
      chrome.runtime.sendMessage({ type: 'fetchStartFlag', data: false });
      chrome.runtime.sendMessage({ type: 'fetchStatus', data: `Fetching complete. ${currentPage} for alphabet ${currentChip}` });
    }
  }

  function extractMedicines() {
    const productCards = document.querySelectorAll('.style__product-card___1gbex');
    let medicineDetails = [];
  
    productCards.forEach(card => {
      const imgElement = card.querySelector('.style__card-image___1oz_4 img');
      const namePriceElement = card.querySelector('.style__flex-1___A_qoj .style__flex-row___2AKyf');
      const descManufElement = card.querySelector('.style__flex-column___1zNVy');
      const drugElement = card.querySelector('.style__product-content___5PFBW');
  
      const medicineDetail = {
        ImgUrl: imgElement?.src || '',
        Name: namePriceElement?.children[0].textContent.trim() || '',
        Price: namePriceElement?.children[1].textContent.replace('MRP', '').trim() || '',
        Desc: descManufElement?.children[0].textContent.trim() || '',
        Manufacturer: descManufElement?.children[1].textContent.trim() || '',
        Drug: drugElement?.textContent.trim() || ''
      };
  
      medicineDetails.push(medicineDetail);
    });
  
    return medicineDetails;
  }

  async function saveMedicinesToStorage(medicines) {
    chrome.storage.local.get(['medicineData'], function(result) {
      const existingMedicines = result.medicineData || [];
      const allMedicines = existingMedicines.concat(medicines);
      console.log('allMedicines: ', allMedicines);
      chrome.storage.local.set({ medicineData: allMedicines });
    });
  }

  async function getFetchingStateFlag() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['stopFetching'], function(result) {
        resolve(result.stopFetching || false);
      });
    });
  }

  if (url.href.includes('https://www.1mg.com/drugs-all-medicines')) {
    chrome.runtime.sendMessage({ type: 'fetchStartFlag', data: true });

    fetchNextPage();
  } else {
    return false;
  }
}

async function displayMedicines(fromDOMContentLoaded = false) {
  chrome.storage.local.get(['medicineData', 'startFetching'], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error accessing storage: ", chrome.runtime.lastError);
      return;
    }

    if (fromDOMContentLoaded & result.startFetching) {
      updateFetchingUI(result.startFetching);
    }

    const medicines = result.medicineData || [];
    const medicineList = document.getElementById('medicine-list');
    if (medicines.length && fromDOMContentLoaded) {
      this.setStatus(`Fetched total ${medicines.length} medicine from ${medicines.length / 30} page`, true);
    };

    const clearBtn = document.getElementById('clear-storage-btn');
    if (fromDOMContentLoaded && !result.startFetching) clearBtn.style.display = medicines.length > 0 ? 'block' : 'none';

    medicineList.innerHTML = '';
    if (medicines.length > 0) {
      medicines.forEach((medicine, index) => {
        const li = document.createElement('li');

        li.innerHTML = `
          <div class="mcard">
            <div class="mleft">
              <span>${index+1}</span>
              <img src="${medicine.ImgUrl}" alt="${medicine.Name}" style="width: 50px; height: 50px; vertical-align: middle;">
            </div>
            <div class="mright">
              <div class="m-head">
                <div class="mname"><strong>Name:</strong> ${medicine.Name}</div>
                <div class="mprice"><strong>Price:</strong> ${medicine.Price}</div>
              </div>
              <div class="m-body">
                <div class="mdesc"><strong>Description:</strong> ${medicine.Desc}</div>
                <div class="mmanufacturer"><strong>Manufacturer:</strong> ${medicine.Manufacturer}</div>
                <div class="mdrug"><strong>Drug:</strong> ${medicine.Drug}</div>
              </div>
            </div>
          </div>
        `;
        li.style.marginBottom = '10px';
        li.style.backgroundColor = '#f5f5f5';
        medicineList.appendChild(li);
      });
    }
  });
}

function setStatus(text, top = false) {
  const status = document.getElementById('status');
  if (status) {
    if (text) status.textContent = text;
    status.style.paddingTop = top ? '20px' : '0px';
  }
}

function updateFetchingUI(isFetching) {
  document.getElementById('clear-storage-btn').style.display = isFetching ? 'none' : 'block';
  document.getElementById('stop-fetching-btn').style.display = isFetching ? 'block' : 'none';
  document.getElementById('fetch-loader-btn').style.display = isFetching ? 'block' : 'none';
  document.getElementById('fetch-medicines-btn').disabled = isFetching;
}
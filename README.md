Medicine Data Fetcher
Overview
Medicine Data Fetcher is a Chrome extension designed to automatically scrape and store detailed information about medicines from the website 1mg. This extension fetches data such as the name, price, description, manufacturer, and drug details of various medicines listed on the site.

Features
Automated Data Fetching: Fetches medicine data from 1mg with a single click.
Storage Management: Stores the fetched data locally using Chrome's storage API and allows clearing of stored data.
User Interface: Simple and user-friendly popup interface to start and stop the data fetching process and view the results.
Installation
Clone or download the repository.
Open the Chrome browser and go to chrome://extensions/.
Enable "Developer mode" in the top-right corner.
Click on "Load unpacked" and select the directory where the extension files are located.
Usage
Navigate to 1mg's All Medicines page in your Chrome browser.
Click on the Medicine Data Fetcher extension icon in the Chrome toolbar.
In the popup, click on the "Fetch Medicines" button to start fetching data.
You can stop the fetching process at any time by clicking the "Stop Fetching" button.
Once fetching is complete, you can clear the stored data by clicking the "Clear" button.
Files
manifest.json
Defines the extension’s metadata, permissions, background script, and content scripts.

background.js
Handles the initialization of storage data when the extension is installed.

popup.html
The HTML file that defines the user interface for the extension popup.

popup.js
JavaScript that powers the popup, handling user interactions, fetching medicines, and managing storage.

Images
Contains the extension icons used in the manifest file.

Permissions
Storage: To store fetched medicine data locally.
Active Tab: To access the currently active tab in the browser.
Scripting: To execute scripts on the currently active tab.
Native Messaging: For communication between the extension's scripts and the background service.
How It Works
Data Fetching: When the user clicks "Fetch Medicines", the extension starts scraping the current page for medicines' details. It iterates through pagination and different categories (labeled by alphabet) to gather comprehensive data.
Data Display: The fetched data is displayed in the popup window in a scrollable list, showing the medicine's name, price, description, manufacturer, and drug information.
Data Storage: All fetched data is stored locally using Chrome's storage API, allowing the user to clear the data when desired.
Contributions
Feel free to contribute to this project by creating issues, suggesting features, or submitting pull requests.

License
This project is licensed under the MIT License.

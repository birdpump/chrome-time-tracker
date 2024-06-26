let activeTabId = null;
let activeTabUrl = null;
let activeTabTitle = null;
let startTime = null;

function getDomainName(url) {
    try {
        return new URL(url).hostname;
    } catch (error) {
        console.error("Error extracting domain:", error);
        return null;
    }
}

async function storeData(url, title, elapsedTime) {
    const domain = getDomainName(url);
    const dateString = new Date().toISOString();
    const data = {
        domain: domain, time: dateString, title: title, timeSpent: elapsedTime
    };

    let ip;

    await fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            ip = data.ip;
        })

    console.log(ip);
    console.log(JSON.stringify({ip, data}));
    fetch('http://localhost:3000/time-data', {
        method: 'POST', headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify({ip, data})
    })
        .catch(error => {
            console.error('Error:', error);
        });


    chrome.storage.local.get({data: []}, function (result) {
        const storedData = result.data;
        storedData.push(data);
        chrome.storage.local.set({data: storedData});
    });
}

function handleTabChange(tab) {
    if (tab && tab.url.startsWith('http')) {
        const now = Date.now();
        if (activeTabId !== null) {
            const elapsedTime = now - startTime;
            storeData(activeTabUrl, activeTabTitle, elapsedTime);
        }

        activeTabId = tab.id;
        activeTabUrl = tab.url;
        activeTabTitle = tab.title || tab.url;

        startTime = now;
    } else {
        if (activeTabId !== null) {
            const now = Date.now();
            const elapsedTime = now - startTime;
            storeData(activeTabUrl, activeTabTitle, elapsedTime);
        }
        activeTabId = null;
        activeTabUrl = null;
        activeTabTitle = null;
        startTime = null;
    }
}

// run when new tab is selected
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, handleTabChange);
});

// see if current active tab changes urls
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.startsWith('http')) {
        handleTabChange(tab);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({data: []}, function (result) {
        const storedData = result.data;
        displayStoredData(storedData);
    });

    const clear = document.getElementById("clear-btn");
    clear.addEventListener("click", function () {
        chrome.storage.local.set({data: []});
        displayStoredData([]);
    });

});

function displayStoredData(data) {
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = '';

    let domains = [];
    data.forEach((entry) => {
        let existingDomainIndex = domains.findIndex(domain => domain.domain === entry.domain);
        if (existingDomainIndex !== -1) {
            domains[existingDomainIndex].time += entry.timeSpent;
        } else {
            domains.push({domain: entry.domain, time: entry.timeSpent});
        }
    });

    domains.sort((a, b) => b.time - a.time);

    renderChart(domains);

    function formatTime(ms) {
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / (1000 * 60)) % 60);
        let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return `${hours}:${minutes}:${seconds}`;
    }

    domains.forEach((entry) => {
        let time = formatTime(entry.time);
        const listItem = document.createElement('div');
        listItem.textContent = `${time} - ${entry.domain}`;
        popupContent.appendChild(listItem);
    });

    const popupContents = document.getElementById('popup-content-other');
    popupContents.innerHTML = '';

    data.forEach((entry) => {
        const listItem = document.createElement('div');
        listItem.textContent = `Domain: ${entry.domain}, Time: ${entry.time}, Title: ${entry.title}, Time Spent: ${entry.timeSpent} ms`;
        popupContents.appendChild(listItem);
    });
}

function renderChart(domains) {
    let domainNames = [];
    let domainTimes = [];
    for (let i = 0; i < domains.length && i < 6; i++) {
        domainNames.push(domains[i].domain);
        domainTimes.push(domains[i].time);
    }

    let ctx = document.getElementById('myChart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: domainNames,
            datasets: [{
                label: 'Times',
                data: domainTimes,
                hoverOffset: 4,
                backgroundColor: [
                    'rgb(54, 162, 235)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 99, 132)',
                ],
            }]
        },

        options: {
            layout: {
                padding: 10,
            },
            title: {
                display: true,
                text: 'Top 6 Sites Visited in Milliseconds',
            },
            legend: {
                display: false,
            }
        }
    });
}
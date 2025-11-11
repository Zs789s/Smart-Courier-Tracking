document.addEventListener('DOMContentLoaded', () => {
    const trackingForm = document.getElementById('tracking-form');
    const resultsSection = document.getElementById('results-section');
    const trackingResultDiv = document.getElementById('tracking-result');
    const errorMessageDiv = document.getElementById('error-message');
    // Use relative API paths so same server can serve frontend + API
    const serverUrl = '';
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    let map = null;
    let marker = null;

    // Check server status
    async function checkServerStatus() {
        try {
            const response = await fetch(`${serverUrl}/api/track/SCS12345`);
            if (response.ok) {
                statusIndicator.className = 'status-indicator online';
                statusText.textContent = 'Server Online (localhost:5000)';
                return true;
            } else {
                statusIndicator.className = 'status-indicator offline';
                statusText.textContent = 'Server Error';
                return false;
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Server Offline';
            return false;
        }
    }

    // Check status immediately and every 30 seconds
    checkServerStatus();
    setInterval(checkServerStatus, 30000);

    trackingForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const trackingNumber = document.getElementById('tracking-number').value.trim().toUpperCase();

        resultsSection.classList.remove('hidden');
        trackingResultDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');

        try {
            // First check if server is available
            if (!await checkServerStatus()) {
                throw new Error('Server is not available');
            }

            const response = await fetch(`${serverUrl}/api/track/${trackingNumber}`);
            const data = await response.json();

            if (response.ok) {
                displayResults(trackingNumber, data);
            } else {
                displayError();
            }
        } catch (error) {
            console.error('Error fetching tracking data:', error);
            displayError();
        }
    });

    function displayResults(trackingNumber, parcel) {
        trackingResultDiv.classList.remove('hidden');
        errorMessageDiv.classList.add('hidden');

        document.getElementById('result-tracking-number').textContent = trackingNumber;
        document.getElementById('current-status').textContent = parcel.status;
        document.getElementById('current-location').textContent = parcel.location;
        document.getElementById('estimated-delivery').textContent = parcel.estimated_delivery;
        
        const historyList = document.getElementById('shipment-history');
        historyList.innerHTML = ''; // Clear previous results
        parcel.history.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.status}</strong> - ${item.location} (${item.date})`;
            historyList.appendChild(li);
        });

        // Initialize or update the map
        if (!map) {
            map = L.map('map').setView([parcel.latitude, parcel.longitude], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            marker = L.marker([parcel.latitude, parcel.longitude]).addTo(map);
        } else {
            map.setView([parcel.latitude, parcel.longitude], 13);
            marker.setLatLng([parcel.latitude, parcel.longitude]);
        }
        
        // Update marker popup with current status
        marker.bindPopup(`
            <strong>${parcel.status}</strong><br>
            Location: ${parcel.location}<br>
            Updated: ${parcel.history[0].date}
        `).openPopup();
    }

    function displayError(message = null) {
        trackingResultDiv.classList.add('hidden');
        errorMessageDiv.classList.remove('hidden');
        if (message) {
            errorMessageDiv.querySelector('p').textContent = message;
        } else {
            errorMessageDiv.querySelector('p').textContent = 'Tracking number not found. Please check the number and try again.';
        }
    }
});
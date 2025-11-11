document.addEventListener('DOMContentLoaded', () => {
    // Use relative paths so the same server serves API and static files
    const serverUrl = '';
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');

    let map = null;
    let mapMarker = null;

    async function checkServerStatus() {
        try {
            const res = await fetch(`/api/track/SCS12345`);
            if (res.ok) {
                statusIndicator.className = 'status-indicator online';
                statusText.textContent = 'Server Online (localhost:5000)';
                return true;
            }
        } catch (e) {}
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'Server Offline';
        return false;
    }

    async function fetchOrders() {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';
        try {
            const response = await fetch(`/api/orders`);
            const data = await response.json();
            if (response.ok) {
                if (data.orders && data.orders.length > 0) {
                    data.orders.forEach(order => {
                        const orderItem = document.createElement('div');
                        orderItem.className = 'order-item';
                        orderItem.innerHTML = `
                            <div>
                                <p><strong>Tracking:</strong> <span class="tracking">${order.tracking_number}</span></p>
                                <p><strong>Status:</strong> <span class="status">${order.status}</span> | <strong>Location:</strong> <span class="location">${order.location}</span></p>
                            </div>
                            <div>
                                <button class="edit-btn" data-id="${order.id}">Edit</button>
                                <button class="delete-btn" data-id="${order.id}">Delete</button>
                            </div>
                        `;
                        orderItem.dataset.order = JSON.stringify(order);
                        ordersList.appendChild(orderItem);
                    });
                } else {
                    ordersList.innerHTML = '<p>No orders found.</p>';
                }
            } else {
                ordersList.innerHTML = `<p>Error loading orders: ${data.message || response.statusText}</p>`;
            }
        } catch (error) {
            ordersList.innerHTML = '<p>Error connecting to server to load orders.</p>';
            console.error('Error fetching orders:', error);
        }
    }

    async function fetchUsers() {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';
        try {
            const response = await fetch(`/api/users`);
            const data = await response.json();
            if (response.ok) {
                if (data.users && data.users.length > 0) {
                    data.users.forEach(user => {
                        const userItem = document.createElement('div');
                        userItem.className = 'user-item';
                        userItem.innerHTML = `
                            <p><strong>Username:</strong> ${user.username} | <strong>Email:</strong> ${user.email}</p>
                            <button class="delete-user-btn" data-id="${user.id}">Delete</button>
                        `;
                        usersList.appendChild(userItem);
                    });
                } else {
                    usersList.innerHTML = '<p>No users found.</p>';
                }
            } else {
                usersList.innerHTML = `<p>Error loading users: ${data.message || response.statusText}</p>`;
            }
        } catch (error) {
            usersList.innerHTML = '<p>Error connecting to server to load users.</p>';
            console.error('Error fetching users:', error);
        }
    }

    // Show order on map
    function showOnMap(order) {
        try {
            const lat = parseFloat(order.latitude) || 0;
            const lng = parseFloat(order.longitude) || 0;
            if (!map) {
                map = L.map('owner-map').setView([lat || 20, lng || 0], lat && lng ? 10 : 2);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
            }
            if (!mapMarker) {
                mapMarker = L.marker([lat, lng]).addTo(map);
            } else {
                mapMarker.setLatLng([lat, lng]);
            }
            map.setView([lat, lng], 10);
            mapMarker.bindPopup(`<strong>${order.tracking_number}</strong><br>${order.status}<br>${order.location}`).openPopup();
        } catch (e) {
            console.error('Map error', e);
        }
    }

    // Initial load
    checkServerStatus();
    setInterval(checkServerStatus, 30000);
    fetchOrders();
    fetchUsers();

    // Delegated events for orders
    document.getElementById('orders-list').addEventListener('click', async (e) => {
        const btn = e.target;
        if (btn.classList.contains('delete-btn')) {
            const orderId = btn.dataset.id;
            if (!confirm('Delete this order?')) return;
            try {
                const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
                if (res.ok) { alert('Order deleted'); fetchOrders(); }
                else { const d = await res.json(); alert(d.message || 'Delete failed'); }
            } catch (err) { alert('Error deleting'); }
        }
        if (btn.classList.contains('edit-btn')) {
            const orderDiv = btn.closest('.order-item');
            const order = JSON.parse(orderDiv.dataset.order);
            openEditModal(order);
        }
    });

    // Delegated events for users
    document.getElementById('users-list').addEventListener('click', async (e) => {
        const btn = e.target;
        if (btn.classList.contains('delete-user-btn')) {
            const userId = btn.dataset.id;
            if (!confirm('Delete this user?')) return;
            try {
                const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
                if (res.ok) { alert('User deleted'); fetchUsers(); }
                else { const d = await res.json(); alert(d.message || 'Delete failed'); }
            } catch (err) { alert('Error deleting user'); }
        }
    });

    // Search and refresh
    document.getElementById('refresh-orders').addEventListener('click', () => fetchOrders());
    document.getElementById('order-search').addEventListener('input', function() {
        const q = this.value.toLowerCase();
        document.querySelectorAll('#orders-list .order-item').forEach(div => {
            const txt = div.innerText.toLowerCase();
            div.style.display = txt.includes(q) ? '' : 'none';
        });
    });

    // Create order handler (simple prompt-based)
    document.getElementById('create-order').addEventListener('click', async () => {
        const carrier = prompt('Carrier', 'SCS Logistics');
        if (!carrier) return;
        const service = prompt('Service', 'Standard');
        const weight = parseFloat(prompt('Weight (kg)', '1')) || 0;
        const status = prompt('Initial status', 'Pending');
        const location = prompt('Location', 'New Location');
        const latitude = parseFloat(prompt('Latitude', '0')) || 0;
        const longitude = parseFloat(prompt('Longitude', '0')) || 0;
        try {
            const res = await fetch(`/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carrier, service, weight, status, location, latitude, longitude })
            });
            const d = await res.json();
            if (res.ok) { alert('Created ' + d.tracking_number); fetchOrders(); }
            else { alert(d.message || 'Create failed'); }
        } catch (err) { alert('Error creating order'); }
    });

    // Edit modal implementation
    function openEditModal(order) {
        let modal = document.getElementById('owner-edit-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'owner-edit-modal';
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-card">
                    <h3>Edit Order <span id="modal-tracking"></span></h3>
                    <label>Status<input id="modal-status"></label>
                    <label>Location<input id="modal-location"></label>
                    <label>Latitude<input id="modal-lat" type="number" step="any"></label>
                    <label>Longitude<input id="modal-lng" type="number" step="any"></label>
                    <label>Estimated Delivery<input id="modal-est"></label>
                    <div class="modal-actions">
                        <button id="modal-save">Save</button>
                        <button id="modal-cancel">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            // styles handled in owner.css
        }
        document.getElementById('modal-tracking').textContent = order.tracking_number;
        document.getElementById('modal-status').value = order.status || '';
        document.getElementById('modal-location').value = order.location || '';
        document.getElementById('modal-lat').value = order.latitude || '';
        document.getElementById('modal-lng').value = order.longitude || '';
        document.getElementById('modal-est').value = order.estimated_delivery || '';

        modal.style.display = 'block';

        document.getElementById('modal-cancel').onclick = () => { modal.style.display = 'none'; };

        document.getElementById('modal-save').onclick = async () => {
            const payload = {
                status: document.getElementById('modal-status').value,
                location: document.getElementById('modal-location').value,
                latitude: parseFloat(document.getElementById('modal-lat').value) || 0,
                longitude: parseFloat(document.getElementById('modal-lng').value) || 0,
                estimated_delivery: document.getElementById('modal-est').value
            };
            try {
                const res = await fetch(`/api/orders/${order.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const d = await res.json();
                if (res.ok) {
                    alert('Order updated');
                    modal.style.display = 'none';
                    fetchOrders();
                    showOnMap(d.order);
                } else { alert(d.message || 'Update failed'); }
            } catch (err) { alert('Error updating order'); }
        };
    }
});
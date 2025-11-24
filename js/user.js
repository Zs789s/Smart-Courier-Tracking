document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return; // verification done on page load

    async function loadMyOrders() {
        try {
            const res = await fetch('/api/myorders', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) {
                console.error('Failed to load orders', res.status);
                document.getElementById('no-user-orders').classList.remove('hidden');
                return;
            }
            const data = await res.json();
            const orders = data.orders || [];
            if (!orders.length) {
                document.getElementById('no-user-orders').classList.remove('hidden');
                return;
            }

            const tbody = document.querySelector('#user-orders-table tbody');
            orders.forEach(o => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><a href="track.html?track=${encodeURIComponent(o.trackingNumber || o.tracking_number)}">${o.trackingNumber || o.tracking_number}</a></td>
                    <td>${o.service || ''}</td>
                    <td>${o.status || ''}</td>
                    <td>${o.location || ''}</td>
                    <td>${o.estimated_delivery || ''}</td>
                `;
                tbody.appendChild(tr);
            });
            document.getElementById('user-orders-table').classList.remove('hidden');
        } catch (err) {
            console.error('Error fetching my orders', err);
            document.getElementById('no-user-orders').classList.remove('hidden');
        }
    }

    loadMyOrders();
});

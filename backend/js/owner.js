(function(){
    const usersContainer = document.getElementById('users-container');
    const noData = document.getElementById('no-data');

    async function fetchOwnerData() {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after login
        if (!token) {
            if (noData) noData.textContent = 'Please log in to view the owner dashboard.';
            noData.classList.remove('hidden');
            return null;
        }

        try {
            const res = await fetch('/api/owner/data', {
                headers: {
                    'x-access-token': token
                },
                cache: 'no-store'
            });

            if (res.status === 401) {
                if (noData) noData.textContent = 'Unauthorized: Invalid or expired token. Please log in again.';
                noData.classList.remove('hidden');
                return null;
            }

            if (!res.ok) {
                if (noData) noData.textContent = `Error fetching data: ${res.statusText}`;
                noData.classList.remove('hidden');
                return null;
            }

            return await res.json();
        } catch (e) {
            if (noData) noData.textContent = `Network error or server unreachable: ${e.message}`;
            noData.classList.remove('hidden');
            return null;
        }
    }

    function renderData(data) {
        if (!data || (!data.users && !data.orders_by_user)) {
            if (noData) noData.classList.remove('hidden');
            return;
        }

        const { users, orders_by_user } = data;

        if (users && users.length > 0) {
            users.forEach(user => {
                const userOrders = orders_by_user[user.id] || [];
                const userSection = document.createElement('div');
                userSection.className = 'user-section';
                userSection.innerHTML = `
                    <h3>User: ${user.username} (ID: ${user.id})</h3>
                    <p>Email: ${user.email}</p>
                    <h4>Orders:</h4>
                `;

                if (userOrders.length > 0) {
                    const table = document.createElement('table');
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>Tracking #</th>
                                <th>Status</th>
                                <th>Location</th>
                                <th>Estimated Delivery</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userOrders.map(order => `
                                <tr>
                                    <td>${order.tracking_number}</td>
                                    <td>${order.status}</td>
                                    <td>${order.location}</td>
                                    <td>${order.estimated_delivery}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    `;
                    userSection.appendChild(table);
                } else {
                    userSection.innerHTML += '<p>No orders for this user.</p>';
                }
                usersContainer.appendChild(userSection);
            });
        } else {
            // Handle case where there are orders but no users (e.g., from default user_id)
            for (const userId in orders_by_user) {
                const userOrders = orders_by_user[userId];
                const userSection = document.createElement('div');
                userSection.className = 'user-section';
                userSection.innerHTML = `
                    <h3>User ID: ${userId}</h3>
                    <h4>Orders:</h4>
                `;
                const table = document.createElement('table');
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Tracking #</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th>Estimated Delivery</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userOrders.map(order => `
                            <tr>
                                <td>${order.tracking_number}</td>
                                <td>${order.status}</td>
                                <td>${order.location}</td>
                                <td>${order.estimated_delivery}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                userSection.appendChild(table);
                usersContainer.appendChild(userSection);
            }
        }
    }

    (async function init(){
        const data = await fetchOwnerData();
        if (data) {
            renderData(data);
        }

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', function(event) {
                event.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = 'login.html'; // Redirect to login page
            });
        }
    })();
})();

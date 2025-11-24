document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const logoutButton = document.getElementById('logout-button');
    const dashboardNavLinks = document.querySelectorAll('.dashboard-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const totalOrdersSpan = document.getElementById('total-orders');
    const pendingShipmentsSpan = document.getElementById('pending-shipments');
    const deliveredOrdersSpan = document.getElementById('delivered-orders');
    const recentOrdersTableBody = document.querySelector('#recent-orders-table tbody');
    const allOrdersTableBody = document.querySelector('#all-orders-table tbody');
    const orderSearchInput = document.getElementById('order-search');
    const orderStatusFilter = document.getElementById('order-status-filter');

    let allUserOrders = []; // To store all orders for filtering

    // Function to show a specific section
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        dashboardNavLinks.forEach(link => {
            if (link.dataset.section === sectionId.replace('-section', '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Handle navigation clicks
    dashboardNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(`${section}-section`);
        });
    });

    // Function to fetch user profile data
    async function fetchUserProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            const response = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                // If token is invalid or expired, redirect to login
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            const userData = await response.json();
            usernameDisplay.textContent = userData.username || 'User';
            profileUsername.textContent = userData.username || 'N/A';
            profileEmail.textContent = userData.email || 'N/A';

            // Populate settings form
            document.getElementById('setting-username').value = userData.username || '';
            document.getElementById('setting-email').value = userData.email || '';
            // Assuming phone and address are part of user data, if not, they will be empty
            document.getElementById('setting-phone').value = userData.phone || '';
            document.getElementById('setting-address').value = userData.address || '';

        } catch (error) {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    }

    // Function to fetch user-specific orders
    async function fetchUserOrders() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/user-orders', { // New API endpoint for user-specific orders
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Error fetching user orders:', response.statusText);
                // Handle error, e.g., show a message to the user
                return;
            }

            const { orders } = await response.json();
            allUserOrders = orders; // Store all orders
            renderOrders(orders); // Render initially without filters
            updateOrderStats(orders);

        } catch (error) {
            console.error('Error fetching user orders:', error);
        }
    }

    // Function to render orders in tables
    function renderOrders(orders) {
        // Render recent orders (e.g., last 5)
        recentOrdersTableBody.innerHTML = '';
        if (orders.length === 0) {
            recentOrdersTableBody.innerHTML = '<tr><td colspan="4">No recent orders.</td></tr>';
        } else {
            orders.slice(0, 5).forEach(order => {
                const row = `
                    <tr>
                        <td><a href="track.html?tracking_number=${order.tracking_number}">${order.tracking_number}</a></td>
                        <td>${order.status}</td>
                        <td>${order.receiver_address}</td>
                        <td>${order.estimated_delivery}</td>
                    </tr>
                `;
                recentOrdersTableBody.innerHTML += row;
            });
        }

        // Render all orders
        allOrdersTableBody.innerHTML = '';
        if (orders.length === 0) {
            allOrdersTableBody.innerHTML = '<tr><td colspan="7">No orders found.</td></tr>';
        } else {
            orders.forEach(order => {
                const row = `
                    <tr>
                        <td><a href="track.html?tracking_number=${order.tracking_number}">${order.tracking_number}</a></td>
                        <td>${order.status}</td>
                        <td>${order.sender_name} <br> ${order.sender_phone}</td>
                        <td>${order.receiver_name} <br> ${order.receiver_phone}</td>
                        <td>${order.parcel_description}</td>
                        <td>${order.estimated_delivery}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="viewOrderDetails('${order.tracking_number}')">View</button>
                        </td>
                    </tr>
                `;
                allOrdersTableBody.innerHTML += row;
            });
        }
    }

    // Function to update order statistics
    function updateOrderStats(orders) {
        totalOrdersSpan.textContent = orders.length;
        pendingShipmentsSpan.textContent = orders.filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled').length;
        deliveredOrdersSpan.textContent = orders.filter(order => order.status === 'Delivered').length;
    }

    // Order filtering and searching
    function filterAndSearchOrders() {
        const searchTerm = orderSearchInput.value.toLowerCase();
        const statusFilter = orderStatusFilter.value;

        const filteredOrders = allUserOrders.filter(order => {
            const matchesSearch = (
                order.tracking_number.toLowerCase().includes(searchTerm) ||
                order.status.toLowerCase().includes(searchTerm) ||
                order.sender_name.toLowerCase().includes(searchTerm) ||
                order.receiver_name.toLowerCase().includes(searchTerm)
            );
            const matchesStatus = statusFilter === '' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        renderOrders(filteredOrders);
    }

    orderSearchInput.addEventListener('input', filterAndSearchOrders);
    orderStatusFilter.addEventListener('change', filterAndSearchOrders);

    // Logout functionality
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Placeholder for view order details (to be implemented)
    window.viewOrderDetails = (trackingNumber) => {
        alert(`Viewing details for tracking number: ${trackingNumber}`);
        // Here you would redirect to a detailed tracking page or open a modal
        window.location.href = `track.html?tracking_number=${trackingNumber}`;
    };

    // Settings form submission (placeholder)
    document.getElementById('profile-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        alert('Profile settings saved!'); // Placeholder
        // Implement API call to update user profile
    });

    // Change password form submission (placeholder)
    document.getElementById('change-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('New password and confirmation do not match.');
            return;
        }

        alert('Password changed successfully!'); // Placeholder
        // Implement API call to change password
    });

    // Initial loads
    fetchUserProfile();
    fetchUserOrders();
    showSection('overview-section'); // Show overview by default
});

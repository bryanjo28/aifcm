// Sidebar loader
fetch('/static/partials/sidebar.html')
.then(res => res.text())
.then(html => {
    const container = document.getElementById('sidebarContainer');
    container.innerHTML = html;

    const currentPath = window.location.pathname;
    const links = container.querySelectorAll('a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath === href) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

async function loadOrders() {
    const res = await fetch('/api/orders');
    const data = await res.json();

    const tbody = document.querySelector('#orderTable tbody');
    const totalCleanEl = document.getElementById('totalClean');
    const totalEstimatedEl = document.getElementById('totalEstimated');

    tbody.innerHTML = '';
    let totalEstimated = 0;
    let totalClean = 0;

    data.forEach((order, index) => {
        totalEstimated += order.totalPrice;
        if (order.paymentStatus === 'paid') {
            totalClean += order.totalPrice;
        }

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${order.fullName}</td>
                <td>${order.email}</td>
                <td>${order.phone || '-'}</td>
                <td>${order.productName}</td>
                <td>Rp ${order.totalPrice.toLocaleString()}</td>
                <td>${order.paymentStatus}</td>
                <td>${new Date(order.paidAt).toLocaleString()}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    totalEstimatedEl.textContent = `Rp ${totalEstimated.toLocaleString()}`;
    totalCleanEl.textContent = `Rp ${totalClean.toLocaleString()}`;
}


loadOrders();
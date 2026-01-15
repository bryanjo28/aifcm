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

  async function loadVouchers() {
    const res = await fetch('/api/vouchers');
    const data = await res.json();

    const tbody = document.querySelector('#voucherTable tbody');
    tbody.innerHTML = '';

    data.forEach((v, index) => {
      const valueLabel = v.type === 'percentage' ? `${v.value}%` : `Rp ${v.value.toLocaleString()}`;
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${v.code}</td>
          <td>${v.type}</td>
          <td>${valueLabel}</td>
          <td>${v.isActive ? 'Active' : 'Inactive'}</td>
          <td>${new Date(v.createdAt).toLocaleString()}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  loadVouchers();

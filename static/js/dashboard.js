
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

const toggleFormBtn = document.getElementById('toggleFormBtn');
const productFormWrapper = document.getElementById('productFormWrapper');
const form = document.getElementById('productForm');

toggleFormBtn.addEventListener('click', () => {
	productFormWrapper.style.display = productFormWrapper.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('closeFormBtn').addEventListener('click', () => {
  form.reset();
  document.getElementById('imagePreview').style.display = 'none';
  productFormWrapper.style.display = 'none';
});


// 🧠 Convert to base64
function toBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = (err) => reject(err);
		reader.readAsDataURL(file);
	});
}

// 📸 Image preview logic
document.getElementById('imageFile').addEventListener('change', function () {
	const file = this.files[0];
	const preview = document.getElementById('imagePreview');

	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			preview.src = e.target.result;
			preview.style.display = 'block';
		};
		reader.readAsDataURL(file);
	} else {
		preview.src = '';
		preview.style.display = 'none';
	}
});

// ✅ Form submit with base64 image
form.addEventListener('submit', async (e) => {
	e.preventDefault();

	let imageBase64 = '';
	const imageFile = document.getElementById('imageFile').files[0];
	if (imageFile) {
		imageBase64 = await toBase64(imageFile);
	}

	const payload = {
		name: document.getElementById('name').value,
		slug: document.getElementById('slug').value,
		description: document.getElementById('description').value,
		price: parseFloat(document.getElementById('price').value),
		imageUrl: imageBase64,
		fileUrl: document.getElementById('fileUrl').value
	};

	const res = await fetch('/api/products', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	if (res.ok) {
		alert("✅ Product added.");
		form.reset();
		document.getElementById('imagePreview').style.display = 'none';
		fetchProducts();
	} else {
		const result = await res.json();
		alert("❌ Error: " + (result.error || 'Unknown error'));
	}
});

// Load product table
async function fetchProducts() {
	const res = await fetch('/api/products');
	const data = await res.json();
	const tbody = document.querySelector('#productTable tbody');
	tbody.innerHTML = '';

	data.forEach((product, index) => {
		const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${product.name}</td>
          <td>${product.slug}</td>
          <td>Rp ${product.price.toLocaleString()}</td>
          <td>${product.isActive ? 'Yes' : 'No'}</td>
          <td>${new Date(product.createdAt).toLocaleString()}</td>
        </tr>
      `;
		tbody.innerHTML += row;
	});
}

fetchProducts();

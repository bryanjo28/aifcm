
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

// Global Variable
const toggleFormBtn = document.getElementById('toggleFormBtn');
const productFormWrapper = document.getElementById('productFormWrapper');
const form = document.getElementById('productForm');
let selectedDeleteId = null;

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

function showAlert(message, type = 'success') {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertBox.style.display = 'block';

  // Auto-hide after 4 seconds
  setTimeout(() => {
    alertBox.style.display = 'none';
    alertBox.innerHTML = '';
  }, 4000);
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
		showAlert("✅ Product Added successfully", "success");
		form.reset();
		document.getElementById('imagePreview').style.display = 'none';
		fetchProducts();
	} else {
		const result = await res.json();
		showAlert(result.error || "❌ Failed to update product", "danger");
	}

});

// ✅ Open edit modal
window.openEditModal = async (id) => {
  const res = await fetch(`/api/products/${id}`);
  const data = await res.json();

  document.getElementById('editProductId').value = data._id;
  document.getElementById('editName').value = data.name;
  document.getElementById('editSlug').value = data.slug;
  document.getElementById('editDescription').value = data.description;
  document.getElementById('editPrice').value = data.price;
  document.getElementById('editFileUrl').value = data.fileUrl;

  if (data.imageUrl) {
    const preview = document.getElementById('editImagePreview');
    preview.src = data.imageUrl;
    preview.style.display = 'block';
  }

  const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
  modal.show();
};



document.getElementById('editImageFile').addEventListener('change', function () {
  const file = this.files[0];
  const preview = document.getElementById('editImagePreview');

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


// ✅ Handle edit form submit
document.getElementById('editProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editProductId').value;
	const imageInput = document.getElementById('editImageFile');
	let imageBase64 = '';

  if (imageInput.files.length > 0) {
		imageBase64 = await toBase64(imageInput.files[0]);
	}
	
	const payload = {
		name: document.getElementById('editName').value,
		slug: document.getElementById('editSlug').value,
		description: document.getElementById('editDescription').value,
		price: parseFloat(document.getElementById('editPrice').value),
		fileUrl: document.getElementById('editFileUrl').value,
		...(imageBase64 && { imageUrl: imageBase64 }) // hanya kirim kalau ada file
	};

  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
		bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
		showAlert("✅ Product updated successfully", "success");
		fetchProducts();
	} else {
		const result = await res.json();
		showAlert(result.error || "❌ Failed to update product", "danger");
	}	
});

// ✅ Open delete confirm modal
window.openDeleteModal = (id) => {
  selectedDeleteId = id;
  const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
  modal.show();
};

// ✅ Handle delete confirm
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  const res = await fetch(`/api/products/${selectedDeleteId}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('deleteProductModal')).hide();
    showAlert("✅ Product delete successfully", "success");
    fetchProducts();
  } else {
    showAlert(result.error || "❌ Failed to delete product", "danger");
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
		   		<td>
						<button class="btn btn-sm btn-warning me-1" onclick="openEditModal('${product._id}')">
							<i class="fa fa-pencil"></i>
						</button>
						<button class="btn btn-sm btn-danger" onclick="openDeleteModal('${product._id}')">
							<i class="fa fa-trash"></i>
						</button>
					</td>

        </tr>
      `;
		tbody.innerHTML += row;
	});
}

fetchProducts();

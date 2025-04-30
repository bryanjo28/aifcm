document.addEventListener("DOMContentLoaded", () => {
  // 📌 Elements
  const noteTextarea = document.getElementById('note');
  const charCounter = noteTextarea.nextElementSibling;
  const paymentMethods = document.querySelectorAll('.payment-method');
  const productSelect = document.getElementById('product');
  const voucherInput = document.getElementById('voucherCode');
  const applyBtn = document.getElementById('applyVoucher');
  const feedback = document.getElementById('voucherFeedback');
  const form = document.querySelector('.checkout-form');
  const confirmBtn = document.getElementById('confirmBtn');

  // 📌 State
  let selectedProduct = null;
  let discount = 0;
  let appliedVoucherCode = null;
  let countdown;

  // 🧠 Character counter
  noteTextarea.addEventListener('input', function () {
    const currentLength = this.value.length;
    const maxLength = this.getAttribute('maxlength');
    charCounter.textContent = `${currentLength}/${maxLength}`;
  });

  // 💳 Payment method toggle
  paymentMethods.forEach(method => {
    method.addEventListener('click', function () {
      paymentMethods.forEach(m => m.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // 🛍 Load product options
  async function loadProducts() {
    const res = await fetch('/api/products');
    const products = await res.json();
    productSelect.innerHTML = `<option value="">-- Select a product --</option>`;
    products.forEach(p => {
      const option = document.createElement('option');
      option.value = JSON.stringify(p);
      option.textContent = p.name;
      productSelect.appendChild(option);
    });
  }

  // 🛒 On product select
  productSelect.addEventListener('change', function () {
    const productPreview = document.getElementById('productPreview');
    if (!this.value) {
      productPreview.style.display = 'none';
      resetOrderSummary();
      return;
    }
  
    selectedProduct = JSON.parse(this.value);
  
    document.getElementById('productImage').src = selectedProduct.imageUrl;
    document.getElementById('productPrice').textContent = `Rp ${selectedProduct.price.toLocaleString()}`;
    productPreview.style.display = 'block';
  
    // Order summary
    const summaryImage = document.getElementById('summaryImage');
    document.getElementById('summaryImageSrc').src = selectedProduct.imageUrl;
    summaryImage.style.display = 'block';
  
    document.getElementById('summaryPrice').textContent = `Rp ${selectedProduct.price.toLocaleString()}`;
    discount = 0;
    appliedVoucherCode = null;
    voucherInput.value = '';
    voucherInput.disabled = false;
    applyBtn.style.display = 'inline-block';
    feedback.textContent = '';
    updateOrderSummary();
  });
  

  // 🧾 Voucher apply
  applyBtn.addEventListener('click', async () => {
    const code = voucherInput.value.trim();
    if (!code || !selectedProduct) {
      feedback.className = 'text-danger mt-1';
      feedback.textContent = 'Please select a product and enter a code.';
      return;
    }

    if (appliedVoucherCode === code) {
      feedback.className = 'text-warning mt-1';
      feedback.textContent = 'Voucher already applied.';
      return;
    }

    // ⏳ Indikator loading
    applyBtn.disabled = true;
    applyBtn.textContent = 'Checking...';
    feedback.className = 'text-muted mt-1';
    feedback.textContent = 'Validating voucher...';

    try {
      const res = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();

      if (!res.ok) {
        feedback.className = 'text-danger mt-1';
        feedback.textContent = data.error || 'Invalid voucher';
        discount = 0;
        appliedVoucherCode = null;
      } else {
        discount = data.type === 'percentage'
          ? Math.floor(selectedProduct.price * (data.value / 100))
          : Math.min(data.value, selectedProduct.price);

        appliedVoucherCode = code;

        // ✅ Kunci input dan sembunyikan tombol
        voucherInput.disabled = true;
        applyBtn.style.display = 'none';

        feedback.className = 'text-success mt-1';
        feedback.innerHTML = `
          Voucher applied: <strong>${code}</strong> —
          Discount: Rp ${discount.toLocaleString()}
          <button id="removeVoucher" class="btn btn-sm btn-link text-danger ms-2">Remove</button>
        `;

        updateOrderSummary();
        bindRemoveVoucher();
      }
    } catch (err) {
      console.error(err);
      feedback.className = 'text-danger mt-1';
      feedback.textContent = 'Error validating voucher';
    } finally {
      applyBtn.disabled = false;
      applyBtn.textContent = 'Apply';
    }
  });

  // Fungsi Remove Voucher (aktifkan ulang input & tombol)
  function bindRemoveVoucher() {
    const removeBtn = document.getElementById('removeVoucher');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        discount = 0;
        appliedVoucherCode = null;
        voucherInput.value = '';
        voucherInput.disabled = false;
        applyBtn.style.display = 'inline-block';
        feedback.className = 'text-muted mt-1';
        feedback.textContent = 'Voucher removed.';
        updateOrderSummary();
      });
    }
  }

  // 🔁 Remove voucher
  function bindRemoveVoucher() {
    const removeBtn = document.getElementById('removeVoucher');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        discount = 0;
        appliedVoucherCode = null;
        voucherInput.value = '';
        feedback.className = 'text-muted mt-1';
        feedback.textContent = 'Voucher removed.';
        updateOrderSummary();
      });
    }
  }

  // 🧮 Update order summary
  function updateOrderSummary() {
    if (!selectedProduct) return;
    document.getElementById('summaryDiscount').textContent = `- Rp ${discount.toLocaleString()}`;
    const total = selectedProduct.price - discount;
    document.getElementById('summaryTotal').textContent = `Rp ${total.toLocaleString()}`;
  }

  // 🧾 Checkout submit (show modal)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!selectedProduct) return alert('Please select a product.');
    document.getElementById('confirmationModal').style.display = 'flex';
    startCountdown();
  });

  // ⏱ Countdown auto-confirm
  function startCountdown() {
    let time = 20;
    const timer = document.getElementById('timer');
    timer.textContent = `Time left: ${time}s`;

    countdown = setInterval(() => {
      time--;
      timer.textContent = `Time left: ${time}s`;
      if (time <= 0) {
        clearInterval(countdown);
        completeOrder();
      }
    }, 1000);
  }

  // ✅ Manual confirm button
  confirmBtn.addEventListener('click', () => {
    clearInterval(countdown);
    completeOrder();
  });

  // 🚀 Send order to server
  async function completeOrder() {
    document.getElementById('confirmationModal').style.display = 'none';
    const finalPrice = selectedProduct.price - discount;

    const payload = {
      fullName: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      note: document.getElementById('note').value,
      productName: selectedProduct.name,
      productPrice: selectedProduct.price,
      totalPrice: finalPrice,
      fileUrl: selectedProduct.fileUrl,
      voucherCode: appliedVoucherCode || null
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
      alert("✅ Payment Confirmed! Product will be sent to your email.");
      form.reset();
      selectedProduct = null;
      discount = 0;
      appliedVoucherCode = null;
    
      document.getElementById('productPreview').style.display = 'none';
      voucherInput.value = '';
      voucherInput.disabled = false;
      applyBtn.style.display = 'inline-block';
      feedback.textContent = '';
      resetOrderSummary();
    }
    else {
      alert("❌ Failed to submit order.");
    }
  }

  function resetOrderSummary() {
    document.getElementById('summaryImage').style.display = 'none';
    document.getElementById('summaryImageSrc').src = '';
    document.getElementById('summaryPrice').textContent = 'Rp 0';
    document.getElementById('summaryDiscount').textContent = '- Rp 0';
    document.getElementById('summaryTotal').textContent = 'Rp 0';
  }
  

  // 🔃 Initial load
  loadProducts();
});

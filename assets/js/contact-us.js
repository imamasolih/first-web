
document.addEventListener('partialLoaded', (e) => {
  if(e.detail.partialKey !== 'partials/contact-us.html') return;

  const form = document.getElementById('contactForm');
  const result = document.getElementById('result');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    clearErrors();

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    let isValid = validateFields();

    const json = JSON.stringify(object);
    if (isValid) {
      sendEmail(json);
    }

    if (result) result.innerHTML = 'Please wait...';
  });
});

function validateFields() {
  const firstName = (document.getElementById('firstName') || {}).value?.trim() || '';
  const lastName = (document.getElementById('lastName') || {}).value?.trim() || '';
  const email = (document.getElementById('email') || {}).value?.trim() || '';
  const message = (document.getElementById('message') || {}).value?.trim() || '';
  const honeyPot = (document.getElementById('honeyPot') || {}).value?.trim() || '';

  if(honeyPot) {
    return false; // Bot detected
  }

  let isValid = true;
  if (!firstName) {
    const el = document.getElementById('firstNameError');
    if (el) el.textContent = 'First name is required';
    isValid = false;
  }
  if (!lastName) {
    const el = document.getElementById('lastNameError');
    if (el) el.textContent = 'Last name is required';
    isValid = false;
  }
  if (!email || !validateEmail(email)) {
    const el = document.getElementById('emailError');
    if (el) el.textContent = 'Valid email is required';
    isValid = false;
  }
  if (!message) {
    const el = document.getElementById('messageError');
    if (el) el.textContent = 'Message is required';
    isValid = false;
  }

  return isValid;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function clearErrors() {
  document.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
  const successEl = document.getElementById('successMessage');
  if (successEl) successEl.textContent = '';
}

function sendEmail(json) {
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: json,
  })
    .then(async (response) => {
      if (response.status == 200) {
        showToast('success', 'Message sent successfully!');

        document.getElementById("contactForm").reset();
      } else {
        showToast('error', 'Error sending message, please try again later.');
      }
    })
    .catch((error) => {
      showToast('error', 'Error sending message, please try again later.');

      console.error("Error:", error);
    });
}

function showToast(type, message) {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Add icon + message + close button
    toast.innerHTML = `
      ${type === 'success' ? `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>` :
      `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>`}
      <span>${message}</span>
    `;

    // Append to container
    container.appendChild(toast);

    // Force reflow to enable transition
    void toast.offsetWidth;
    toast.classList.add('show');

    // Auto-remove after duration
    setTimeout(() => removeToast(toast), 4000);
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }
// Load agreement text on page load
fetch('/api/agreement')
  .then((res) => res.text())
  .then((text) => {
    document.getElementById('agreement').innerHTML = `
      <h3>Agreement</h3>
      <p>${text.replace(/\n/g, '<br>')}</p>
    `;
  });

// Handle form submission
document.getElementById('questionnaireForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  const res = await fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    alert('✅ Thank you! Your response has been submitted.');
    form.reset();
  } else {
    alert('❌ Something went wrong. Please try again.');
  }
});

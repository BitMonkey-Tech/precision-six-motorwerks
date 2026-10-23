// "Join the P6 Community" popup on the homepage.
//
// Opens the <dialog id="subscribe-popup"> a few seconds after the page loads
// and sends signups to a Google Apps Script web app, which appends them to the
// "P6 Subscribers" Google Sheet (see /google-apps-script/p6-subscribers.gs).

(function () {
  // Paste the Apps Script "Web app URL" (ends in /exec) here. Until it is set,
  // the popup stays hidden for visitors; add #join to the URL to preview it.
  const SHEET_URL =
    "https://script.google.com/macros/s/AKfycbwvNaYHF3QHWHj-iwsjxVPB8JNp3ex3_ilvKI3b2laVKfSvyCRK0HMtnMtkiWwimWjE/exec";

  const OPEN_DELAY_MS = 2000;
  const STORAGE_KEY = "p6-subscribe";

  const dialog = document.getElementById("subscribe-popup");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const form = dialog.querySelector("form");
  const status = dialog.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  // localStorage remembers, per browser, that this visitor already joined.
  // Closing the popup is not remembered, so it shows on every visit until they
  // sign up. try/catch because it can be blocked (e.g. private browsing).
  function hasJoined() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return Boolean(saved && saved.joined);
    } catch (e) {
      return false;
    }
  }
  function remember(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (e) {}
  }

  const forced = location.hash === "#join";
  if (forced) {
    dialog.showModal();
  } else if (SHEET_URL && !hasJoined()) {
    setTimeout(() => {
      // Don't interrupt someone who is already typing in a form on the page.
      if (!document.querySelector("form :focus")) dialog.showModal();
    }, OPEN_DELAY_MS);
  }

  // Clicking the dark area around the box closes it. A click on the backdrop
  // is reported with the <dialog> itself as the target.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!SHEET_URL) {
      status.textContent = "Signups are not connected yet.";
      status.classList.add("error");
      return;
    }

    submitBtn.disabled = true;
    status.textContent = "Joining…";
    status.classList.remove("error");

    const data = new URLSearchParams(new FormData(form));
    data.set("page", location.pathname);

    try {
      // A URL encoded body keeps this a "simple" request, so the browser
      // sends it straight to Google without a CORS preflight check first.
      const res = await fetch(SHEET_URL, { method: "POST", body: data });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error || `HTTP ${res.status}`);

      remember({ joined: true });
      form.hidden = true;
      dialog.querySelector(".sub-thanks").hidden = false;
      setTimeout(() => dialog.close(), 3500);
    } catch (err) {
      status.textContent = "Something went wrong. Please try again.";
      status.classList.add("error");
      submitBtn.disabled = false;
    }
  });
})();

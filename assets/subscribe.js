// "Join the P6 Community" popup on the contact page.
//
// Opens the <dialog id="subscribe-popup"> a few seconds after the page loads
// and sends signups to a Google Apps Script web app, which appends them to the
// "P6 Subscribers" Google Sheet (see /google-apps-script/p6-subscribers.gs).

(function () {
  // Paste the Apps Script "Web app URL" (ends in /exec) here. Until it is set,
  // the popup stays hidden for visitors; add #join to the URL to preview it.
  const SHEET_URL =
    "https://script.google.com/macros/s/AKfycbxiW1BqRQ_7Re2EliDYm2Y6S1EJqhLBkgeoFuzDKD98ASXKDD3Spe3lHpDtTGK3onA/exec";

  const OPEN_DELAY_MS = 6000;
  const SNOOZE_DAYS = 14; // after closing, wait this long before showing again
  const STORAGE_KEY = "p6-subscribe";

  const dialog = document.getElementById("subscribe-popup");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const form = dialog.querySelector("form");
  const status = dialog.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  // localStorage remembers, per browser, that this visitor joined or closed
  // the popup. try/catch because it can be blocked (e.g. private browsing).
  function remembered() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return false;
      if (saved.joined) return true;
      return Date.now() - saved.closedAt < SNOOZE_DAYS * 864e5;
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
  } else if (SHEET_URL && !remembered()) {
    setTimeout(() => {
      // Don't interrupt someone who is already typing in the quote form.
      if (!document.querySelector(".contact-form :focus")) dialog.showModal();
    }, OPEN_DELAY_MS);
  }

  // The "close" event fires however the dialog is closed: the X, Esc, or a
  // backdrop click. Snooze it unless they already joined.
  dialog.addEventListener("close", () => {
    if (dialog.dataset.joined) return;
    remember({ closedAt: Date.now() });
  });

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

      dialog.dataset.joined = "1";
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

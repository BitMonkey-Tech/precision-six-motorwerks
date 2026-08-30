// BitMonkey Tech shared contact-form handler.
//
// Posts each <form class="js-form"> to the postbox mail service instead of
// letting the browser do a normal form submit. Set FORM_ID to this site's key
// in postbox's clients.json.
//
// Each form must:
//   - have class "js-form"
//   - contain a <p class="form-status" aria-live="polite"></p>
//   - contain a hidden honeypot input:
//       <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"
//              aria-hidden="true" style="position:absolute;left:-9999px">

(function () {
  const ENDPOINT = "https://postbox.bitmonkeytech.com";
  const FORM_ID = "p6motorwerks";

  document.querySelectorAll(".js-form").forEach((form) => {
    const status = form.querySelector(".form-status");
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitBtn) submitBtn.disabled = true;
      if (status) {
        status.textContent = "Sending…";
        status.classList.remove("error");
      }

      try {
        const res = await fetch(`${ENDPOINT}/f/${FORM_ID}`, {
          method: "POST",
          body: new FormData(form),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok) {
          form.reset();
          if (status) {
            status.textContent = "Thanks! We'll be in touch soon.";
            status.classList.remove("error");
          }
        } else {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
      } catch (err) {
        if (status) {
          status.textContent =
            "Something went wrong — please try again or email us directly.";
          status.classList.add("error");
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();

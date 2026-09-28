/*
 * Contact drawer, as on gulfalts.com: "Inquire" (navbar) and "Contact" (footer) slide a white
 * panel in from the right with the inquiry form. Native <dialog> gives focus trapping and
 * Escape; the drawer stops Lenis while open.
 *
 * Submission is UI-only for now (CONTACT_ENDPOINT is null): the form validates, shows its
 * loading state, then tells the visitor to email instead, so nobody believes an inquiry was
 * sent when it was not. Set CONTACT_ENDPOINT to a form backend to send for real.
 */
import type Lenis from 'lenis';

const CONTACT_ENDPOINT: string | null = null;
const CLOSE_MS = 400;

const messages = {
  sent: 'Thank you! Your submission has been received!',
  failed: 'Oops! Something went wrong while submitting the form. Please try again or email info@gulfalts.com.',
  preview: 'Thank you. This preview does not send inquiries yet; please email info@gulfalts.com and we will reply shortly.'
};

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export const initContact = (lenis: Lenis | null) => {
  const dialog = document.querySelector<HTMLDialogElement>('#contact-dialog');
  if (!dialog) return;
  const form = dialog.querySelector<HTMLFormElement>('.contact-form')!;
  const submit = form.querySelector<HTMLButtonElement>('.contact-form_submit')!;
  const status = form.querySelector<HTMLElement>('.contact-form_status')!;
  let opener: HTMLElement | null = null;
  let closingTimer = 0;

  const finishClose = () => {
    dialog.close();
    dialog.classList.remove('is-closing');
    document.body.classList.remove('contact-open');
    lenis?.start();
    opener?.focus({ preventScroll: true });
    // Start fresh next time once an inquiry has gone through.
    if (form.classList.contains('is-sent')) {
      form.reset();
      form.classList.remove('is-sent');
      status.textContent = '';
    }
  };
  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.remove('is-visible');
    dialog.classList.add('is-closing');
    window.clearTimeout(closingTimer);
    closingTimer = window.setTimeout(finishClose, CLOSE_MS);
  };
  const open = (trigger: HTMLElement) => {
    opener = trigger;
    window.clearTimeout(closingTimer);
    dialog.classList.remove('is-closing');
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('contact-open');
    lenis?.stop();
    requestAnimationFrame(() => dialog.classList.add('is-visible'));
  };

  document.querySelectorAll<HTMLElement>('[data-contact-open]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      open(trigger);
    });
  });
  dialog.querySelector('.contact-drawer_close')!.addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  // A click on the backdrop (outside the panel) closes the drawer.
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });

  // ---- Validation: errors appear under the field once it has been submitted or left.
  const fields = [
    { input: form.querySelector<HTMLInputElement>('#contact-name')!, valid: (v: string) => v.trim().length > 1 },
    { input: form.querySelector<HTMLInputElement>('#contact-email')!, valid: (v: string) => isEmail(v.trim()) },
    { input: form.querySelector<HTMLSelectElement>('#contact-type')!, valid: (v: string) => v !== '' }
  ];
  const check = (field: typeof fields[number]) => {
    const ok = field.valid(field.input.value);
    const error = form.querySelector<HTMLElement>(`#${field.input.getAttribute('aria-describedby')}`)!;
    field.input.toggleAttribute('aria-invalid', !ok);
    error.hidden = ok;
    return ok;
  };
  fields.forEach(field => {
    field.input.addEventListener('blur', () => { if (field.input.value) check(field); });
    field.input.addEventListener('input', () => { if (field.input.hasAttribute('aria-invalid')) check(field); });
    field.input.addEventListener('change', () => { if (field.input.hasAttribute('aria-invalid')) check(field); });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const results = fields.map(check);
    if (results.includes(false)) {
      fields[results.indexOf(false)].input.focus();
      return;
    }
    form.classList.remove('is-failed');
    form.classList.add('is-loading');
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    status.textContent = '';
    try {
      if (CONTACT_ENDPOINT) {
        const response = await fetch(CONTACT_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Contact form: ${response.status}`);
        status.textContent = messages.sent;
      } else {
        await new Promise(resolve => window.setTimeout(resolve, 700));
        status.textContent = messages.preview;
      }
      form.classList.add('is-sent');
    } catch {
      status.textContent = messages.failed;
      form.classList.add('is-failed');
    } finally {
      form.classList.remove('is-loading');
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      // Disabling the button dropped focus; put it back so keyboard users stay in the form.
      submit.focus();
    }
  });
};

/* Feedback stays isolated from existing pages, navigation, and account flows. */
(function () {
  'use strict';
  const MAX_IMAGES = 5, MAX_BYTES = 5 * 1024 * 1024;
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const glyph = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const letter = glyph('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>');
  const closeIcon = glyph('<path d="m6 6 12 12M6 18 18 6"/>');
  const check = glyph('<path d="m5 12 4 4L19 6"/>');
  const TYPES = {
    feature_request: { name: "Request Feature", hint: "Help shape Shiyu", label: "Your Idea", placeholder: "What would you like to add or improve? Tell us how you would use it.", attachments: true,
      icon: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>' },
    usage_issue: { name: "Report Issue", hint: "What went wrong?", label: "Issue Details", placeholder: "Describe the steps, what you expected, and what happened.", category: true, attachments: true,
      icon: '<path d="M8 4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9l-5 3V8a4 4 0 0 1 4-4Z"/><path d="M12 8v4m0 3h.01"/>' },
    appreciation: { name: "Say Thanks", hint: "Send a little kindness", label: "Your Message", placeholder: "What made your day? We'd love to hear it.",
      icon: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>' },
    experience: { name: "Share Experience", hint: "Shiyu in your everyday life", label: "Share Experience", placeholder: "How do you use Shiyu? Share a habit, a tip, or a story.",
      icon: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14M6 9h3m-3 4h3m6-4h3m-3 4h3"/>' }
  };
  let dialog, form, owner, images = [], reading = 0, generation = 0, loading = false, sending = false;
  let attempt = null, result = null, fileQueue = Promise.resolve(), categoryRequest = 0;
  let selectedType = '', drafts = {}, categoryReady = false;
  const field = name => form.elements.namedItem(name);
  const ownerKey = () => signed ? String(accountProfile().id || 'local') : 'guest';
  const invalidate = () => { attempt = null; };

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.id = 'support-feedback';
    dialog.setAttribute('aria-labelledby', 'feedback-title');
    dialog.setAttribute('aria-describedby', 'feedback-intro');
    dialog.innerHTML = `
      <div class="feedback-heading">
        <div class="feedback-kicker">${letter}<span>Feedback</span><i>SHIYU · LETTERS</i></div>
        <button type="button" class="feedback-close" data-feedback-close aria-label="Close Feedback">${closeIcon}</button>
        <h2 id="feedback-title" tabindex="-1">We're listening.</h2>
        <p id="feedback-intro">Ideas, issues, or a quick hello.</p>
      </div>
      <form id="feedback-form" novalidate>
        <div class="feedback-scroll">
          <fieldset class="feedback-fields">
            <fieldset class="feedback-types">
              <legend>Feedback Type <span class="feedback-required">Required</span></legend>
              <div class="feedback-type-options">
                ${Object.entries(TYPES).map(([id, type]) => `<label><input type="radio" name="type" value="${id}" required><span class="feedback-type-card">${glyph(type.icon)}<span><strong>${type.name}</strong><small>${type.hint}</small></span><i>${check}</i></span></label>`).join('')}
              </div>
            </fieldset>
            <div class="feedback-field feedback-category-field" hidden>
              <label id="feedback-category-label" for="feedback-category-trigger">Category <span class="feedback-required">Required</span></label>
              <div class="feedback-select">
                <select id="feedback-category" name="categoryId" data-enhanced="true" hidden tabindex="-1" aria-hidden="true"><option value="">Choose a category</option></select>
                <button type="button" id="feedback-category-trigger" class="feedback-category-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="feedback-category-options" aria-labelledby="feedback-category-label feedback-category-value"><span id="feedback-category-value">Choose a category</span>${glyph('<path d="m8 10 4 4 4-4"/>')}</button>
                <div id="feedback-category-options" class="feedback-category-options" popover="manual" role="listbox" aria-labelledby="feedback-category-label"></div>
              </div>
              <div class="feedback-category-status" hidden><span></span><button type="button" data-feedback-reload>Reload</button></div>
            </div>
            <div class="feedback-field feedback-description-field" hidden>
              <label for="feedback-description"><b class="feedback-description-label">Details</b> <span class="feedback-required">Required</span></label>
              <div class="feedback-description-wrap"><textarea id="feedback-description" name="description" maxlength="3000" required placeholder="What could be better?&amp;#10;Share the steps, expected result, and what happened."></textarea><span class="feedback-count" aria-live="off">0 / 3000</span></div>
            </div>
            <div class="feedback-field feedback-images-field" hidden>
              <div class="feedback-upload-heading"><label for="feedback-files">Add Images <span>Optional</span></label><span class="feedback-image-count">0 / 5</span></div>
              <input id="feedback-files" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden>
              <div class="feedback-image-list" aria-label="Added Images" hidden></div>
              <button type="button" class="feedback-upload" data-feedback-upload>
                ${glyph('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21m10-6 6 6"/>')}
                <span><strong>Choose, drop, or paste images</strong><small>Up to 5 images · 5 MB each · PNG / JPG / WebP / GIF</small></span>
              </button>
              <p class="feedback-image-error" role="status" hidden></p>
            </div>
            <div class="feedback-field feedback-contact-field" hidden>
              <label for="feedback-contact">Contact <span>Optional, in case we need to follow up</span></label>
              <input id="feedback-contact" name="contact" type="text" maxlength="120" placeholder="Phone or email" autocomplete="off">
            </div>
          </fieldset>
        </div>
        <div class="feedback-footer">
          <p class="feedback-error" role="alert" hidden></p>
          <div><p>Every message matters.</p><button type="submit" class="feedback-submit">Send Feedback ${glyph('<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>')}</button></div>
        </div>
      </form>
      <section class="feedback-success" hidden aria-live="polite">
        <div class="feedback-delivered">${letter}${check}</div><h3>Message Received</h3>
        <p>Thanks for helping us improve Shiyu.<br>We'll read your feedback and follow up if needed.</p>
        <button type="button" class="feedback-submit" data-feedback-close>Back Home</button>
      </section>`;
    document.body.append(dialog);
    form = dialog.querySelector('form');
    dialog.querySelectorAll('[data-feedback-close]').forEach(button => button.onclick = () => dialog.close());
    dialog.querySelector('[data-feedback-reload]').onclick = () => loadCategories();
    dialog.querySelector('[data-feedback-upload]').onclick = () => dialog.querySelector('#feedback-files').click();
    dialog.querySelector('#feedback-files').onchange = event => { queueImages(Array.from(event.target.files)); event.target.value = ''; };
    form.addEventListener('input', event => {
      invalidate(); event.target.removeAttribute('aria-invalid');
      dialog.querySelector('.feedback-error').hidden = true;
      dialog.querySelector('.feedback-count').textContent = `${field('description').value.length} / 3000`;
    });
    form.addEventListener('change', event => { invalidate(); if (event.target.name === 'type') switchType(); });
    bindCategoryPicker();
    form.onsubmit = submit;
    dialog.addEventListener('paste', event => {
      if (sending || result || !TYPES[selectedType]?.attachments) return;
      const files = Array.from(event.clipboardData?.items || []).filter(item => item.kind === 'file' && item.type.startsWith('image/')).map(item => item.getAsFile()).filter(Boolean);
      if (files.length) { event.preventDefault(); queueImages(files); }
    });
    dialog.addEventListener('dragover', event => {
      if (!Array.from(event.dataTransfer?.types || []).includes('Files')) return;
      event.preventDefault(); if (!sending && !result && TYPES[selectedType]?.attachments) dialog.classList.add('feedback-dragging');
    });
    dialog.addEventListener('dragleave', event => { if (!dialog.contains(event.relatedTarget)) dialog.classList.remove('feedback-dragging'); });
    dialog.addEventListener('drop', event => {
      if (!Array.from(event.dataTransfer?.types || []).includes('Files')) return;
      event.preventDefault(); dialog.classList.remove('feedback-dragging');
      if (!sending && !result && TYPES[selectedType]?.attachments) queueImages(Array.from(event.dataTransfer.files));
    });
    dialog.addEventListener('close', () => {
      closeCategoryPicker();
      dialog.classList.remove('feedback-dragging');
      document.querySelector('[data-account-open]')?.focus({ preventScroll: true });
    });
  }

  function reset() {
    generation++; images = []; result = null; attempt = null; reading = 0; sending = false;
    owner = ownerKey();
    selectedType = ''; drafts = {}; categoryRequest++; loading = false;
    form.reset(); form.hidden = false;
    dialog.querySelector('.feedback-success').hidden = true;
    dialog.querySelector('.feedback-count').textContent = '0 / 3000';
    dialog.querySelector('.feedback-error').hidden = true;
    dialog.querySelector('.feedback-image-error').hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(element => element.removeAttribute('aria-invalid'));
    renderImages();
    switchType();
  }
  function switchType() {
    if (selectedType) drafts[selectedType] = { description: field('description').value, categoryId: field('categoryId').value, contact: field('contact').value, images: [...images] };
    selectedType = field('type').value;
    generation++; reading = 0; invalidate(); closeCategoryPicker();
    const type = TYPES[selectedType], draft = drafts[selectedType] || {};
    field('description').value = draft.description || '';
    field('description').required = Boolean(type);
    field('description').placeholder = type?.placeholder || '';
    field('categoryId').value = draft.categoryId || '';
    field('categoryId').required = Boolean(type?.category);
    field('contact').value = draft.contact || '';
    images = [...(draft.images || [])]; renderImages(); imageNotice('');
    dialog.querySelector('.feedback-description-field').hidden = !type;
    dialog.querySelector('.feedback-category-field').hidden = !type?.category;
    dialog.querySelector('.feedback-images-field').hidden = !type?.attachments;
    dialog.querySelector('.feedback-contact-field').hidden = !type?.attachments;
    dialog.querySelector('.feedback-description-label').textContent = type?.label || "Details";
    dialog.querySelector('.feedback-count').textContent = `${field('description').value.length} / 3000`;
    dialog.querySelector('.feedback-error').hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    if (type?.category) loadCategories();
    syncCategoryPicker(); syncSubmit();
  }
  function syncSubmit() {
    form.querySelector('.feedback-fields').disabled = sending;
    const button = form.querySelector('[type=submit]');
    button.disabled = sending || reading > 0 || Boolean(TYPES[selectedType]?.category && (loading || !categoryReady));
    button.innerHTML = sending ? "Sending…" : reading ? "Loading images…" : `Send Feedback ${glyph('<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>')}`;
    form.setAttribute('aria-busy', String(sending || reading > 0));
  }
  async function loadCategories() {
    const token = ++categoryRequest;
    const select = field('categoryId');
    const notice = dialog.querySelector('.feedback-category-status');
    loading = true; categoryReady = false; select.disabled = true; notice.hidden = true; closeCategoryPicker(); syncCategoryPicker(); syncSubmit();
    try {
      const response = await fetch('/api/shiyu/feedback/categories', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000) });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.items)) throw Error(data.message || "Categories Unavailable");
      if (token !== categoryRequest) return;
      const previous = select.value;
      select.replaceChildren(new Option("Choose a category", ''));
      data.items.forEach(item => select.add(new Option(item.name, item.id)));
      select.value = data.items.some(item => item.id === previous) ? previous : '';
      if (select.value !== previous) invalidate();
      categoryReady = true; select.disabled = false;
    } catch {
      if (token !== categoryRequest) return;
      notice.hidden = false; notice.querySelector('span').textContent = "Couldn't load categories. Try again.";
    } finally { if (token === categoryRequest) { loading = false; syncCategoryPicker(); syncSubmit(); } }
  }
  function closeCategoryPicker(focus = false) {
    const list = dialog.querySelector('#feedback-category-options');
    if (list.matches(':popover-open')) list.hidePopover();
    const trigger = dialog.querySelector('#feedback-category-trigger');
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus({ preventScroll: true });
  }
  function syncCategoryPicker() {
    const trigger = dialog.querySelector('#feedback-category-trigger');
    trigger.disabled = loading || !categoryReady;
    trigger.setAttribute('aria-required', String(Boolean(TYPES[selectedType]?.category)));
    dialog.querySelector('#feedback-category-value').textContent = loading ? "Loading categories…" : !categoryReady ? "Categories Unavailable" : field('categoryId').selectedOptions[0]?.textContent || "Choose a category";
  }
  function openCategoryPicker(edge) {
    const trigger = dialog.querySelector('#feedback-category-trigger'), list = dialog.querySelector('#feedback-category-options');
    if (trigger.disabled || sending) return;
    list.replaceChildren();
    Array.from(field('categoryId').options).filter(option => option.value).forEach(option => {
      const button = document.createElement('button'); button.type = 'button'; button.setAttribute('role', 'option'); button.setAttribute('aria-selected', String(option.selected));
      const label = document.createElement('span'); label.textContent = option.textContent; button.append(label); button.insertAdjacentHTML('beforeend', check);
      button.onclick = () => { field('categoryId').value = option.value; field('categoryId').dispatchEvent(new Event('change', { bubbles: true })); trigger.removeAttribute('aria-invalid'); dialog.querySelector('.feedback-error').hidden = true; syncCategoryPicker(); closeCategoryPicker(true); };
      list.append(button);
    });
    if (!list.childElementCount) { const empty = document.createElement('p'); empty.textContent = "No categories available. Try later."; list.append(empty); }
    const rect = trigger.getBoundingClientRect(), bounds = dialog.getBoundingClientRect();
    const bottom = Math.min(innerHeight - 12, bounds.bottom - 12) - rect.bottom - 6;
    const top = rect.top - Math.max(12, bounds.top + 12) - 6;
    const upwards = bottom < 220 && top > bottom;
    const height = Math.max(40, Math.min(220, upwards ? top : bottom));
    Object.assign(list.style, { width: `${rect.width}px`, maxHeight: `${height}px`, left: `${rect.left}px`, top: '0px' });
    if (!list.matches(':popover-open')) list.showPopover();
    list.style.top = `${upwards ? rect.top - list.getBoundingClientRect().height - 6 : rect.bottom + 6}px`;
    trigger.setAttribute('aria-expanded', 'true');
    const options = list.querySelectorAll('[role=option]');
    const chosen = edge === 'last' ? options[options.length - 1] : edge === 'first' ? options[0] : list.querySelector('[aria-selected=true]') || options[0];
    chosen?.focus({ preventScroll: true });
  }
  function bindCategoryPicker() {
    const trigger = dialog.querySelector('#feedback-category-trigger'), list = dialog.querySelector('#feedback-category-options');
    trigger.onclick = () => list.matches(':popover-open') ? closeCategoryPicker() : openCategoryPicker();
    trigger.onkeydown = event => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); openCategoryPicker(['ArrowUp', 'End'].includes(event.key) ? 'last' : 'first'); }
      if (event.key === 'Escape' && list.matches(':popover-open')) { event.preventDefault(); event.stopPropagation(); closeCategoryPicker(true); }
    };
    list.onkeydown = event => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); const items = [...list.querySelectorAll('[role=option]')], i = items.indexOf(document.activeElement);
        items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (i + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
      }
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeCategoryPicker(true); }
      if (event.key === 'Tab') { event.preventDefault(); closeCategoryPicker(); (event.shiftKey ? trigger : field('description')).focus(); }
    };
    dialog.addEventListener('pointerdown', event => { if (!event.target.closest('.feedback-select')) closeCategoryPicker(); });
    dialog.addEventListener('focusin', event => { if (!event.target.closest('.feedback-select')) closeCategoryPicker(); });
    dialog.addEventListener('cancel', event => { if (list.matches(':popover-open')) { event.preventDefault(); closeCategoryPicker(true); } });
    dialog.querySelector('.feedback-scroll').addEventListener('scroll', () => closeCategoryPicker());
    window.addEventListener('resize', () => closeCategoryPicker());
  }
  function imageNotice(message) {
    const notice = dialog.querySelector('.feedback-image-error');
    notice.textContent = message; notice.hidden = !message;
  }
  function queueImages(files) {
    if (!files.length || sending || !TYPES[selectedType]?.attachments) return;
    const token = generation;
    reading++; syncSubmit();
    fileQueue = fileQueue.then(async () => {
      if (token !== generation) return;
      const errors = new Set();
      for (const file of files) {
        if (token !== generation) break;
        if (images.length >= MAX_IMAGES) { errors.add("5-image limit. Remove one to add another."); break; }
        if (!allowed.includes(file.type)) { errors.add("Use PNG, JPG, WebP, or GIF."); continue; }
        if (file.size > MAX_BYTES) { errors.add("Image exceeds 5 MB. Resize it first."); continue; }
        try {
          const bitmap = await createImageBitmap(file);
          const tooLarge = bitmap.width * bitmap.height > 40000000; bitmap.close();
          if (tooLarge) { errors.add("Image dimensions are too large. Resize it first."); continue; }
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
          });
          if (token !== generation) break;
          images.push({ name: (file.name || `Pasted-image-${images.length + 1}.png`).slice(0, 150), dataUrl }); invalidate();
        } catch { errors.add("Couldn't read an image. Try another."); }
      }
      if (token === generation) { imageNotice([...errors].join(' ')); renderImages(); }
    }).finally(() => { if (token === generation) { reading--; syncSubmit(); } });
  }
  function renderImages() {
    const list = dialog.querySelector('.feedback-image-list');
    list.replaceChildren(); list.hidden = !images.length;
    images.forEach((item, index) => {
      const cell = document.createElement('div'); cell.className = 'feedback-thumbnail';
      const preview = document.createElement('button'); preview.type = 'button'; preview.setAttribute('aria-label', `Preview image ${index + 1}`);
      const img = document.createElement('img'); img.src = item.dataUrl; img.alt = item.name; preview.append(img); preview.onclick = () => previewImage(item);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'feedback-remove'; remove.innerHTML = closeIcon; remove.setAttribute('aria-label', `Remove image ${index + 1}`);
      remove.onclick = () => { images.splice(index, 1); invalidate(); imageNotice(''); renderImages(); dialog.querySelector('[data-feedback-upload]').focus(); };
      cell.append(preview, remove); list.append(cell);
    });
    dialog.querySelector('.feedback-image-count').textContent = `${images.length} / 5`;
    const upload = dialog.querySelector('[data-feedback-upload]');
    upload.disabled = images.length >= MAX_IMAGES;
    upload.querySelector('strong').textContent = images.length >= MAX_IMAGES ? "5 images added. Remove one to replace it." : images.length ? "Add or paste more images" : "Choose, drop, or paste images";
  }
  function previewImage(item) {
    let preview = document.querySelector('#feedback-image-preview');
    if (!preview) {
      preview = document.createElement('dialog'); preview.id = 'feedback-image-preview'; preview.setAttribute('aria-label', "Image Preview");
      preview.innerHTML = `<button type="button" aria-label="Close Preview">${closeIcon}</button><img alt="">`;
      preview.querySelector('button').onclick = () => preview.close(); document.body.append(preview);
    }
    preview.querySelector('img').src = item.dataUrl; preview.querySelector('img').alt = item.name; preview.showModal();
  }
  function showError(message, target) {
    const error = dialog.querySelector('.feedback-error'); error.textContent = message; error.hidden = false;
    if (target) { target.setAttribute('aria-invalid', 'true'); target.focus(); }
  }
  function identitySnapshot() {
    const profile = signed ? accountProfile() : {};
    const paid = signed && Number(prefs.membership?.expiresAt) > Date.now();
    const demo = signed && Number(prefs.membershipDemo?.expiresAt) > Date.now();
    return { signedIn: Boolean(signed && profile.id), id: profile.id || null, name: profile.name || "Me",
      isMember: Boolean(isMember()), membershipSource: paid ? 'membership' : demo ? 'demo' : 'none',
      membershipExpiresAt: paid || demo ? new Date(Math.max(Number(prefs.membership?.expiresAt) || 0, Number(prefs.membershipDemo?.expiresAt) || 0)).toISOString() : null };
  }
  async function submit(event) {
    event.preventDefault();
    const type = TYPES[selectedType];
    if (sending || reading || (type?.category && (loading || !categoryReady))) return;
    if (ownerKey() !== owner) { reset(); showError("Account changed. Please fill in the form again."); return; }
    if (!type) { showError("Choose a feedback type.", form.querySelector('[name=type]')); return; }
    if (type.category && !field('categoryId').value) { showError("Choose an issue category.", dialog.querySelector('#feedback-category-trigger')); return; }
    if (!field('description').value.trim()) { showError(`Enter ${type.label} before sending.`, field('description')); return; }
    const contact = type.attachments ? field('contact').value.trim() : '';
    if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !(/^\+?[\d ()-]{6,30}$/.test(contact) && (contact.match(/\d/g) || []).length >= 6)) { showError("Enter a valid phone number or email.", field('contact')); return; }
    if (!attempt) attempt = JSON.stringify({ submissionId: crypto.randomUUID(), applicationId: 'shiyu', type: field('type').value,
      categoryId: type.category ? field('categoryId').value : null, description: field('description').value.trim(), contact, images: type.attachments ? images : [],
      identity: identitySnapshot(), context: { page: location.pathname, theme: effective().theme,
        mode: document.body.dataset.dark === 'true' ? 'dark' : 'light', viewport: `${innerWidth} × ${innerHeight}` } });
    const token = generation;
    sending = true; syncSubmit(); dialog.querySelector('.feedback-error').hidden = true;
    try {
      const response = await fetch('/api/shiyu/feedback', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: attempt, signal: AbortSignal.timeout(30000) });
      const data = await response.json();
      if (token !== generation) return;
      if (!response.ok) {
        if (response.status === 409 && data.message?.includes("Category")) { invalidate(); loadCategories(); }
        throw Error(data.message || "Couldn't send. Try again.");
      }
      if (typeof data.receipt !== 'string') throw Error("Save not confirmed. Try again.");
      result = data; images = []; form.hidden = true;
      dialog.querySelector('.feedback-success').hidden = false;
      dialog.querySelector('.feedback-success>p').textContent = contact ? "Thanks for helping us improve Shiyu. We'll read your feedback and follow up if needed." : "Thanks for sharing. Your feedback matters.";
      dialog.querySelector('.feedback-success button').focus();
    } catch (error) {
      if (token === generation) showError(error.name === 'TimeoutError' || error instanceof TypeError || error instanceof SyntaxError ? "Delivery not confirmed. Your message is saved; try again." : error.message);
    } finally { if (token === generation) { sending = false; syncSubmit(); } }
  }
  function openFeedback() {
    if (!dialog) createDialog();
    if (owner !== ownerKey() || (!sending && result)) reset();
    document.querySelector('.account-menu-wrap')?.classList.remove('menu-pinned');
    document.querySelector('[data-account-open]')?.setAttribute('aria-expanded', 'false');
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('#feedback-title').focus({ preventScroll: true });
    if (!sending && TYPES[selectedType]?.category) loadCategories();
  }
  function addEntry() {
    if (view !== 'home') return;
    const menu = document.querySelector('.account-menu');
    if (!menu || menu.querySelector('[data-menu-feedback]')) return;
    const button = document.createElement('button'); button.type = 'button'; button.dataset.menuFeedback = '';
    button.setAttribute('role', 'menuitem'); button.setAttribute('aria-haspopup', 'dialog'); button.title = "Feedback & Ideas";
    button.innerHTML = `${letter}Feedback`; button.onclick = openFeedback;
    const after = menu.querySelector('[data-menu-extension]') || menu.querySelector('[data-account-signout]'); if (after) after.before(button); else menu.append(button);
  }
  const headerBeforeFeedback = updateHeader;
  updateHeader = function () { headerBeforeFeedback(); addEntry(); if (dialog && owner !== ownerKey()) reset(); };
  addEntry();
})();

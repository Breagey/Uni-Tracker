/* =====================================================
   VIEW + BASIC ELEMENTS
===================================================== */
const currentView = document.body.dataset.view || 'notes';
const notesGrid = document.querySelector('.notes-grid');
const addNoteBtn = document.querySelector('.add-note');

const modal = document.getElementById('note-modal') || null;
const noteForm = document.getElementById('note-form') || null;
const cancelBtn = document.getElementById('cancel-modal') || null;
const courseNameInput = document.getElementById('course-name') || null;

const optionButtons = document.querySelectorAll('.option-toggle');
const sectionRows = document.querySelectorAll('.section-row');
const hourSelects = document.querySelectorAll('.hour-select');
const minuteSelects = document.querySelectorAll('.minute-select');

const STORAGE_KEY = 'uniTrackerNotes';

/* =====================================================
   STORAGE HELPERS
===================================================== */
function loadAllNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading notes:', e);
    return [];
  }
}

function saveAllNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function addNote(note) {
  const notes = loadAllNotes();
  notes.push(note);
  saveAllNotes(notes);
}

function updateNoteStatus(id, newStatus) {
  const notes = loadAllNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notes[idx].status = newStatus;
    saveAllNotes(notes);
  }
}

function deleteNoteById(id) {
  let notes = loadAllNotes();
  notes = notes.filter((n) => n.id !== id);
  saveAllNotes(notes);
}

/* =====================================================
   PLACEHOLDER HANDLING
===================================================== */
function getPlaceholderText() {
  if (currentView === 'archive') return 'Archived notes will appear here...';
  if (currentView === 'trash') return 'Deleted notes will appear here...';
  return 'Your course notes will appear here...';
}

function ensurePlaceholder() {
  if (!notesGrid) return;
  let ph = notesGrid.querySelector('.note-placeholder');
  if (!ph) {
    ph = document.createElement('div');
    ph.className = 'note-placeholder';
    ph.textContent = getPlaceholderText();
    notesGrid.appendChild(ph);
  }
}

function removePlaceholder() {
  if (!notesGrid) return;
  const ph = notesGrid.querySelector('.note-placeholder');
  if (ph) ph.remove();
}

/* =====================================================
   SELECT BUILDERS (HOURS / MINUTES / DAYS)
===================================================== */
function buildHourOptions(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">HH</option>';
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, '0');
    const opt = document.createElement('option');
    opt.value = hh;
    opt.textContent = hh;
    selectEl.appendChild(opt);
  }
}

function buildMinuteOptions(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">MM</option>';
  for (let m = 0; m < 60; m++) {
    const mm = String(m).padStart(2, '0');
    const opt = document.createElement('option');
    opt.value = mm;
    opt.textContent = mm;
    selectEl.appendChild(opt);
  }
}

function buildDayOptions(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">—</option>';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    selectEl.appendChild(opt);
  });
}

/* Only the Notes page has these modal hour/minute selects */
hourSelects.forEach(buildHourOptions);
minuteSelects.forEach(buildMinuteOptions);

/* =====================================================
   MODAL OPEN/CLOSE (NOTES PAGE ONLY)
===================================================== */
function openModal() {
  if (!modal) return;
  modal.classList.remove('hidden');
  if (courseNameInput) {
    courseNameInput.value = '';
    courseNameInput.focus();
  }
  resetOptionButtons();
}

function closeModal() {
  if (!modal) return;
  modal.classList.add('hidden');
}

if (
  currentView === 'notes' &&
  addNoteBtn &&
  modal &&
  noteForm &&
  courseNameInput &&
  cancelBtn
) {
  addNoteBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* =====================================================
   MODAL SECTION TOGGLES (NOTES PAGE ONLY)
===================================================== */
function updateOptionButtonText(btn) {
  const name = btn.dataset.section;
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  btn.textContent = (btn.classList.contains('active') ? '✓ ' : '✕ ') + label;
}

function setScheduleEnabledForButton(btn) {
  const row = btn.closest('.section-row');
  if (!row) return;
  const schedule = row.querySelector('.section-schedule');
  if (!schedule) return;
  const enabled = btn.classList.contains('active');
  const inputs = schedule.querySelectorAll('select');

  if (enabled) {
    schedule.classList.remove('disabled');
    inputs.forEach((el) => (el.disabled = false));
  } else {
    schedule.classList.add('disabled');
    inputs.forEach((el) => (el.disabled = true));
  }
}

function resetOptionButtons() {
  sectionRows.forEach((row) => {
    const btn = row.querySelector('.option-toggle');
    const schedule = row.querySelector('.section-schedule');
    const selects = schedule.querySelectorAll('select');

    if (btn.dataset.section === 'seminars') {
      btn.classList.remove('active');
    } else {
      btn.classList.add('active');
    }

    selects.forEach((sel) => {
      sel.value = '';
    });

    updateOptionButtonText(btn);
    setScheduleEnabledForButton(btn);
  });
}

/* Only run toggles setup if we're on the notes page (where the modal exists) */
if (currentView === 'notes') {
  optionButtons.forEach((btn) => {
    updateOptionButtonText(btn);
    setScheduleEnabledForButton(btn);
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      updateOptionButtonText(btn);
      setScheduleEnabledForButton(btn);
    });
  });
}

/* =====================================================
   SESSION ROWS ON CARDS
===================================================== */
function addSessionRow(container, sectionTitle, initialDay = '', initialTime = '') {
  const row = document.createElement('div');
  row.className = 'todo-row session-row';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const timeWrapper = document.createElement('div');
  timeWrapper.className = 'session-time-wrapper';

  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'session-time-pill';

  const editBox = document.createElement('div');
  editBox.className = 'session-time-edit hidden';

  const daySelect = document.createElement('select');
  daySelect.className = 'session-day-select';
  buildDayOptions(daySelect);

  const hourSelect = document.createElement('select');
  hourSelect.className = 'session-hour-select';
  buildHourOptions(hourSelect);

  const minuteSelect = document.createElement('select');
  minuteSelect.className = 'session-minute-select';
  buildMinuteOptions(minuteSelect);

  const colon = document.createTextNode(':');

  const doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.className = 'session-time-done';
  doneBtn.textContent = 'Done';

  if (initialDay) daySelect.value = initialDay;
  if (initialTime) {
    const [hh, mm] = initialTime.split(':');
    if (hh) hourSelect.value = hh;
    if (mm) minuteSelect.value = mm;
  }

  function updatePillText() {
    const day = daySelect.value;
    const hh = hourSelect.value;
    const mm = minuteSelect.value;
    if (day || (hh && mm)) {
      const parts = [];
      if (day) parts.push(day);
      if (hh && mm) parts.push(`${hh}:${mm}`);
      pill.textContent = parts.join(' · ');
    } else {
      pill.textContent = 'Set day / time';
    }
  }

  updatePillText();

  pill.addEventListener('click', () => {
    pill.classList.add('hidden');
    editBox.classList.remove('hidden');
    (daySelect.value ? hourSelect : daySelect).focus();
  });

  doneBtn.addEventListener('click', () => {
    updatePillText();
    editBox.classList.add('hidden');
    pill.classList.remove('hidden');
  });

  [daySelect, hourSelect, minuteSelect].forEach((sel) => {
    sel.addEventListener('change', updatePillText);
  });

  editBox.appendChild(daySelect);
  editBox.appendChild(hourSelect);
  editBox.appendChild(colon);
  editBox.appendChild(minuteSelect);
  editBox.appendChild(doneBtn);

  timeWrapper.appendChild(pill);
  timeWrapper.appendChild(editBox);

  const editable = document.createElement('div');
  editable.className = 'todo-text';
  editable.contentEditable = 'true';
  editable.setAttribute(
    'data-placeholder',
    `Type ${sectionTitle.toLowerCase()} details or tasks here…`
  );

  checkbox.addEventListener('change', () => {
    editable.classList.toggle('done', checkbox.checked);
  });

  row.appendChild(checkbox);
  row.appendChild(timeWrapper);
  row.appendChild(editable);

  container.appendChild(row);
}

/* =====================================================
   DELETE / TRASH CONFIRM (CENTER POPUP + GRAY OVERLAY)
===================================================== */
function toggleDeleteConfirm(card) {
  const id = card.dataset.id;
  const inTrash = currentView === 'trash';

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'delete-overlay';

  // Create popup
  const popup = document.createElement('div');
  popup.className = 'delete-popup';

  const msg = document.createElement('div');
  msg.textContent = inTrash
    ? 'Delete this note permanently?'
    : 'Move this note to Trash?';

  const buttons = document.createElement('div');
  buttons.className = 'delete-popup-buttons';

  const confirm = document.createElement('button');
  confirm.className = 'delete-confirm-btn';
  confirm.textContent = inTrash ? 'Delete' : 'Move to Trash';

  const cancel = document.createElement('button');
  cancel.className = 'delete-cancel-btn';
  cancel.textContent = 'Cancel';

  cancel.addEventListener('click', () => {
    overlay.remove();
  });

  confirm.addEventListener('click', () => {
    overlay.remove();

    if (inTrash) {
      deleteNoteById(id);
    } else {
      updateNoteStatus(id, 'trash');
    }

    card.remove();
    if (!notesGrid.querySelector('.course-note')) {
      ensurePlaceholder();
    }
  });

  buttons.appendChild(confirm);
  buttons.appendChild(cancel);

  popup.appendChild(msg);
  popup.appendChild(buttons);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

function attachDeleteHandler(card) {
  const btn = card.querySelector('.course-note-delete');
  if (!btn) return;
  btn.addEventListener('click', () => {
    toggleDeleteConfirm(card);
  });
}

function attachRestoreHandler(card) {
  if (currentView !== 'trash') return;

  const btn = card.querySelector('.course-note-restore');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const id = card.dataset.id;
    updateNoteStatus(id, 'notes');

    card.remove();

    if (!notesGrid.querySelector('.course-note')) {
      ensurePlaceholder();
    }
  });
}


/* =====================================================
   CARD CREATION FROM NOTE OBJECT
===================================================== */
function createCourseCardFromNote(note) {
  if (!notesGrid) return;

  const card = document.createElement('article');
  card.className = 'course-note';
  card.dataset.id = note.id;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'course-note-delete';
  deleteBtn.setAttribute('aria-label', 'Delete note');
  deleteBtn.textContent = '✕';
  card.appendChild(deleteBtn);

  const header = document.createElement('header');
  header.className = 'course-note-header';
  header.textContent = note.courseName;
  card.appendChild(header);

  if (currentView === 'trash') {
    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'course-note-restore';
    restoreBtn.textContent = 'Restore';
    card.appendChild(restoreBtn);
  }

  const body = document.createElement('div');
  body.className = 'course-note-body';
  card.appendChild(body);

  const titles = {
    lectures: 'Lectures',
    tutorials: 'Tutorials',
    seminars: 'Seminars'
  };

  note.sections.forEach((key) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'course-section';

    const h3 = document.createElement('h3');
    h3.textContent = titles[key];
    sectionDiv.appendChild(h3);

    const sessionsContainer = document.createElement('div');
    sessionsContainer.className = 'session-list';
    sectionDiv.appendChild(sessionsContainer);

    const sched = (note.schedule && note.schedule[key]) || {};
    addSessionRow(
      sessionsContainer,
      titles[key],
      sched.day || '',
      sched.time || ''
    );

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-session-btn';
    addBtn.textContent = '+ Add another time';
    addBtn.addEventListener('click', () => {
      addSessionRow(sessionsContainer, titles[key], '', '');
    });

    sectionDiv.appendChild(addBtn);
    body.appendChild(sectionDiv);
  });

  attachDeleteHandler(card);
  attachRestoreHandler(card);

  notesGrid.appendChild(card);
}


/* =====================================================
   INITIAL RENDER FOR CURRENT VIEW
===================================================== */
(function renderInitial() {
  if (!notesGrid) return;

  const allNotes = loadAllNotes();
  const viewNotes = allNotes.filter((n) => n.status === currentView);

  if (viewNotes.length === 0) {
    ensurePlaceholder();
  } else {
    removePlaceholder();
    viewNotes.forEach((n) => createCourseCardFromNote(n));
  }
})();

/* =====================================================
   FORM SUBMIT (NOTES PAGE ONLY)
===================================================== */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

if (currentView === 'notes' && noteForm && courseNameInput) {
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const courseName = courseNameInput.value.trim();
    if (!courseName) {
      alert('Please enter a course name.');
      return;
    }

    const activeSections = Array.from(optionButtons)
      .filter((btn) => btn.classList.contains('active'))
      .map((btn) => btn.dataset.section);

    if (activeSections.length === 0) {
      alert('Select at least one section.');
      return;
    }

    const scheduleBySection = {};
    activeSections.forEach((name) => {
      const row = document.querySelector(
        `.section-row[data-section="${name}"]`
      );
      if (!row) return;
      const daySel = row.querySelector('.day-select');
      const hourSel = row.querySelector('.hour-select');
      const minuteSel = row.querySelector('.minute-select');

      const hh = hourSel ? hourSel.value : '';
      const mm = minuteSel ? minuteSel.value : '';
      let time = '';
      if (hh && mm) time = `${hh}:${mm}`;

      scheduleBySection[name] = {
        day: daySel ? daySel.value : '',
        time
      };
    });

    const note = {
      id: generateId(),
      courseName,
      sections: activeSections,
      schedule: scheduleBySection,
      status: 'notes'
    };

    addNote(note);
    removePlaceholder();
    createCourseCardFromNote(note);
    closeModal();
  });
}

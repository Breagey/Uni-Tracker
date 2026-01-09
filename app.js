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
   ID HELPER
===================================================== */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

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

function saveNoteObject(updatedNote) {
  const notes = loadAllNotes();
  const idx = notes.findIndex((n) => n.id === updatedNote.id);
  if (idx !== -1) {
    notes[idx] = updatedNote;
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
   SELECT BUILDERS
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

function buildMonthOptions(selectEl) {
  if (!selectEl) return;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  selectEl.innerHTML = '<option value="">MM</option>';
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i; // 0-11
    opt.textContent = m;
    selectEl.appendChild(opt);
  });
}

function buildDateOptions(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">DD</option>';
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    selectEl.appendChild(opt);
  }
}

function buildRepeatOptions(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = `
    <option value="none">Does not repeat</option>
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="monthly">Monthly</option>
    <option value="yearly">Yearly</option>
  `;
}

/* Only the Notes page modal has these hour/minute selects */
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

    selects.forEach((sel) => (sel.value = ''));

    updateOptionButtonText(btn);
    setScheduleEnabledForButton(btn);
  });
}

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
   SESSIONS (LECT/TUT/SEM) ROWS ON CARDS
   - Includes Day / Time / Repeat like your screenshot
===================================================== */
function repeatLabel(rep) {
  if (!rep || rep === 'none') return 'Does not repeat';
  return rep.charAt(0).toUpperCase() + rep.slice(1);
}

function addSessionRow(container, sectionTitle, note, sectionKey, sessionObj, editable) {
  const row = document.createElement('div');
  row.className = 'todo-row session-row';

  row.dataset.sessionId = sessionObj.id;
  row.dataset.noteId = note.id;
  row.dataset.sectionKey = sectionKey;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.disabled = !editable;
  checkbox.checked = !!sessionObj.completed;
  row.classList.toggle('row-completed', !!sessionObj.completed);


  const timeWrapper = document.createElement('div');
  timeWrapper.className = 'session-time-wrapper';

  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'session-time-pill';
  pill.disabled = !editable;

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

  const repeatSelect = document.createElement('select');
  repeatSelect.className = 'session-repeat-select';
  buildRepeatOptions(repeatSelect);

  const colon = document.createTextNode(':');

  const doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.className = 'session-time-done';
  doneBtn.textContent = 'Done';
  doneBtn.disabled = !editable;

  // Restore from sessionObj
  daySelect.value = sessionObj.day || '';
  repeatSelect.value = sessionObj.repeat || 'none';

  if (sessionObj.time) {
    const [hh, mm] = sessionObj.time.split(':');
    if (hh) hourSelect.value = hh;
    if (mm) minuteSelect.value = mm;
  }

  function updatePillText() {
    const day = daySelect.value;
    const hh = hourSelect.value;
    const mm = minuteSelect.value;
    const rep = repeatSelect.value || 'none';

    const parts = [];
    if (day) parts.push(day);
    if (hh && mm) parts.push(`${hh}:${mm}`);
    parts.push(repeatLabel(rep));

    pill.textContent = parts.join(' · ');
  }

  function ensureSessionTimesArray() {
    if (!note.sessionTimes) note.sessionTimes = {};
    if (!Array.isArray(note.sessionTimes[sectionKey])) note.sessionTimes[sectionKey] = [];
  }

  function saveSessionFromControls() {
    if (!editable) return;

    const hh = hourSelect.value;
    const mm = minuteSelect.value;

    sessionObj.day = daySelect.value || '';
    sessionObj.time = (hh && mm) ? `${hh}:${mm}` : '';
    sessionObj.repeat = repeatSelect.value || 'none';
    sessionObj.nextResetAt = computeNextSessionResetAt(sessionObj, Date.now());

    ensureSessionTimesArray();
    const idx = note.sessionTimes[sectionKey].findIndex(s => s.id === sessionObj.id);
    if (idx === -1) note.sessionTimes[sectionKey].push(sessionObj);
    else note.sessionTimes[sectionKey][idx] = sessionObj;

    saveNoteObject(note);
  }

  if (!sessionObj.nextResetAt) {
    sessionObj.nextResetAt = computeNextSessionResetAt(sessionObj, Date.now());
  }

  updatePillText();

  if (editable) {
    pill.addEventListener('click', () => {
      pill.classList.add('hidden');
      editBox.classList.remove('hidden');
      daySelect.focus();
    });

    doneBtn.addEventListener('click', () => {
      updatePillText();
      editBox.classList.add('hidden');
      pill.classList.remove('hidden');
      saveSessionFromControls();
    });

    [daySelect, hourSelect, minuteSelect, repeatSelect].forEach((sel) => {
      sel.addEventListener('change', () => {
        updatePillText();
        saveSessionFromControls();
      });
    });
  }

  editBox.appendChild(daySelect);
  editBox.appendChild(hourSelect);
  editBox.appendChild(colon);
  editBox.appendChild(minuteSelect);
  editBox.appendChild(repeatSelect);
  editBox.appendChild(doneBtn);

  timeWrapper.appendChild(pill);
  timeWrapper.appendChild(editBox);

  const editableText = document.createElement('div');
  editableText.className = 'todo-text';
  editableText.contentEditable = editable ? 'true' : 'false';
  editableText.setAttribute('data-placeholder', `Type ${sectionTitle.toLowerCase()} details here…`);
  editableText.textContent = sessionObj.text || '';

  if (editable) {
    editableText.addEventListener('blur', () => {
      sessionObj.text = editableText.textContent.trim();
      saveNoteObject(note);
    });

    editableText.addEventListener('input', () => {
      sessionObj.text = editableText.textContent;
    });
  }

  checkbox.addEventListener('change', () => {
    sessionObj.completed = checkbox.checked;
    editableText.classList.toggle('done', checkbox.checked);
    row.classList.toggle('row-completed', checkbox.checked);
    saveNoteObject(note);
  });

  row.appendChild(checkbox);
  row.appendChild(timeWrapper);
  row.appendChild(editableText);
  container.appendChild(row);
}

/* =====================================================
   DELETE / TRASH CONFIRM (CENTER POPUP + GRAY OVERLAY)
===================================================== */
function toggleDeleteConfirm(card) {
  const id = card.dataset.id;
  const inTrash = currentView === 'trash';

  const overlay = document.createElement('div');
  overlay.className = 'delete-overlay';

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

  cancel.addEventListener('click', () => overlay.remove());

  confirm.addEventListener('click', () => {
    overlay.remove();

    if (inTrash) deleteNoteById(id);
    else updateNoteStatus(id, 'trash');

    card.remove();
    if (!notesGrid.querySelector('.course-note')) ensurePlaceholder();
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
  btn.addEventListener('click', () => toggleDeleteConfirm(card));
}

function attachRestoreHandler(card) {
  if (currentView !== 'trash') return;

  const btn = card.querySelector('.course-note-restore');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const id = card.dataset.id;
    updateNoteStatus(id, 'notes');

    card.remove();
    if (!notesGrid.querySelector('.course-note')) ensurePlaceholder();
  });
}

/* =====================================================
   TASK HELPERS (DEADLINES + LABELS)
===================================================== */
function computeDueTimestamp(day, monthIndex) {
  if (!day || monthIndex === '') return null;

  const now = new Date();
  const year = now.getFullYear();

  let due = new Date(year, monthIndex, parseInt(day, 10), 23, 59, 0, 0);
  if (due.getTime() < now.getTime()) {
    due = new Date(year + 1, monthIndex, parseInt(day, 10), 23, 59, 0, 0);
  }
  return due.getTime();
}

function getTaskUrgencyClass(day, monthIndex) {
  const ts = computeDueTimestamp(day, monthIndex);
  if (!ts) return 'task-none';

  const now = Date.now();
  const diffHours = (ts - now) / (1000 * 60 * 60);

  if (diffHours <= 0) return 'task-overdue';
  if (diffHours <= 24) return 'task-critical';
  if (diffHours <= 72) return 'task-warning';
  return 'task-ok';
}

function formatTaskDueLabel(day, monthIndex) {
  const ts = computeDueTimestamp(day, monthIndex);
  if (!ts) return 'No deadline';

  const now = Date.now();
  const diff = ts - now;
  const diffHours = diff / (1000 * 60 * 60);

  const absHours = Math.abs(diffHours);
  const days = Math.floor(absHours / 24);
  const hours = Math.floor(absHours % 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (!parts.length) parts.push('<1h');

  if (diffHours >= 0) return `Due in ${parts.join(' ')}`;
  return `Overdue by ${parts.join(' ')}`;
}

function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(dateObj, months) {
  const d = new Date(dateObj);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);

  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d;
}

function addYears(dateObj, years) {
  const d = new Date(dateObj);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function advanceTaskDueDate(task) {
  if (!task || !task.day || task.month === '' || task.month === undefined) return false;
  if (!task.repeat || task.repeat === 'none') return false;

  const baseTs = computeDueTimestamp(task.day, Number(task.month));
  if (!baseTs) return false;

  let next = new Date(baseTs);

  if (task.repeat === 'daily') next = addDays(next, 1);
  else if (task.repeat === 'weekly') next = addDays(next, 7);
  else if (task.repeat === 'monthly') next = addMonths(next, 1);
  else if (task.repeat === 'yearly') next = addYears(next, 1);
  else return false;

  task.day = next.getDate();
  task.month = next.getMonth();
  return true;
}

function rolloverRepeatingTaskIfDuePassed(task, nowMs = Date.now()) {
  if (!task || !task.repeat || task.repeat === 'none') return false;
  if (!task.day || task.month === '' || task.month === undefined) return false;

  let changed = false;
  let ts = computeDueTimestamp(task.day, Number(task.month));
  if (!ts) return false;

  while (ts <= nowMs) {
    const ok = advanceTaskDueDate(task);
    if (!ok) break;
    changed = true;

    task.completed = false;

    ts = computeDueTimestamp(task.day, Number(task.month));
    if (!ts) break;
  }

  return changed;
}

/* =====================================================
   TASK ROW (adds Repeat selector: none/daily/weekly/monthly/yearly)
===================================================== */
function renderTaskRow(task, note, container, editable) {
  const row = document.createElement('div');
  row.className = 'task-row';

  row.dataset.taskId = task.id;
  row.dataset.noteId = note.id;

  row.classList.toggle('row-completed', !!task.completed);

  // LEFT
  const left = document.createElement('div');
  left.className = 'task-left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!task.completed;
  checkbox.disabled = !editable;

  const text = document.createElement('div');
  text.className = 'task-text';
  text.contentEditable = editable ? 'true' : 'false';
  text.setAttribute('data-placeholder', 'Type task details…');
  text.textContent = task.text || '';
  if (task.completed) text.classList.add('done');

  left.appendChild(checkbox);
  left.appendChild(text);

  // RIGHT
  const right = document.createElement('div');
  right.className = 'task-right';

  const timeWrapper = document.createElement('div');
  timeWrapper.className = 'session-time-wrapper';

  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'session-time-pill';
  pill.disabled = !editable;

  const editBox = document.createElement('div');
  editBox.className = 'session-time-edit hidden';

  const dateSelect = document.createElement('select');
  dateSelect.className = 'task-date-select';
  buildDateOptions(dateSelect);

  const monthSelect = document.createElement('select');
  monthSelect.className = 'task-month-select';
  buildMonthOptions(monthSelect);

  const repeatSelect = document.createElement('select');
  repeatSelect.className = 'task-repeat-select';
  buildRepeatOptions(repeatSelect);

  // restore values
  if (task.day) dateSelect.value = String(task.day);
  if (task.month !== undefined && task.month !== '') monthSelect.value = String(task.month);
  repeatSelect.value = task.repeat || 'none';

  const dueLabel = document.createElement('span');
  dueLabel.className = 'task-due';

  const urgencyClasses = ['task-none','task-ok','task-warning','task-critical','task-overdue'];

  function applyUrgencyAndLabel() {
    urgencyClasses.forEach((cls) => row.classList.remove(cls));

    const monthIndex =
      (task.month === '' || task.month === undefined) ? '' : Number(task.month);

    const cls = getTaskUrgencyClass(task.day, monthIndex);
    row.classList.add(cls);

    dueLabel.textContent = formatTaskDueLabel(task.day, monthIndex);
  }

  function updatePillText() {
    const hasDate = task.day && task.month !== '' && task.month !== undefined;
    if (!hasDate) {
      pill.textContent = `${repeatLabel(task.repeat || 'none')}`;
      return;
    }

    const monthIdx = Number(task.month);
    const monthText =
      monthSelect.options[monthIdx + 1]
        ? monthSelect.options[monthIdx + 1].textContent
        : monthSelect.options[monthSelect.selectedIndex]?.textContent || '';

    pill.textContent = `${task.day} ${monthText} · ${repeatLabel(task.repeat || 'none')}`;
  }

  function syncTaskFromControls() {
    task.day = dateSelect.value || '';
    task.month = monthSelect.value === '' ? '' : Number(monthSelect.value);
    task.repeat = repeatSelect.value || 'none';

    updatePillText();
    applyUrgencyAndLabel();
    saveNoteObject(note);
  }

  // init UI
  updatePillText();
  applyUrgencyAndLabel();

  const doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.className = 'session-time-done';
  doneBtn.textContent = 'Done';
  doneBtn.disabled = !editable;

  if (editable) {
    pill.addEventListener('click', () => {
      pill.classList.add('hidden');
      editBox.classList.remove('hidden');
      dateSelect.focus();
    });

    doneBtn.addEventListener('click', () => {
      editBox.classList.add('hidden');
      pill.classList.remove('hidden');
      syncTaskFromControls();
    });

    [dateSelect, monthSelect, repeatSelect].forEach((sel) => {
      sel.addEventListener('change', syncTaskFromControls);
    });
  }

  editBox.appendChild(dateSelect);
  editBox.appendChild(monthSelect);
  editBox.appendChild(repeatSelect);
  editBox.appendChild(doneBtn);

  timeWrapper.appendChild(pill);
  timeWrapper.appendChild(editBox);

  right.appendChild(timeWrapper);
  right.appendChild(dueLabel);

  // checkbox + text saving
  if (editable) {
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      text.classList.toggle('done', task.completed);

      row.classList.toggle('row-completed', task.completed);

      saveNoteObject(note);
    });

    text.addEventListener('blur', () => {
      task.text = text.textContent.trim();
      saveNoteObject(note);
    });

    text.addEventListener('input', () => {
      task.text = text.textContent;
    });
  }

  row.appendChild(left);
  row.appendChild(right);
  container.appendChild(row);
}

/* =====================================================
   CARD CREATION FROM NOTE OBJECT
   - Renders sessions with Repeat selector
   - Renders tasks with Repeat selector
===================================================== */
function createCourseCardFromNote(note) {
  if (!notesGrid) return;

  const editableCard = currentView === 'notes';

  const card = document.createElement('article');
  card.className = 'course-note';
  card.dataset.id = note.id;

  // Delete / trash
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

  // Restore in Trash view
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

  // Ensure sessionTimes exists + back-compat conversion
  if (!note.sessionTimes) note.sessionTimes = {};

  note.sections.forEach((key) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'course-section';

    const h3 = document.createElement('h3');
    h3.textContent = titles[key];
    sectionDiv.appendChild(h3);

    const sessionsContainer = document.createElement('div');
    sessionsContainer.className = 'session-list';
    sectionDiv.appendChild(sessionsContainer);

    // Back-compat: if no sessionTimes for this section, create from old note.schedule
    if (!Array.isArray(note.sessionTimes[key])) {
      const sched = (note.schedule && note.schedule[key]) || {};
      note.sessionTimes[key] = [{
        id: generateId(),
        day: sched.day || '',
        time: sched.time || '',
        repeat: 'none'
      }];
      saveNoteObject(note);
    }

    // Render all session times
    note.sessionTimes[key].forEach((sessionObj) => {
      addSessionRow(sessionsContainer, titles[key], note, key, sessionObj, editableCard);
    });

    // Add another time
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-session-btn';
    addBtn.textContent = '+ Add another time';
    addBtn.disabled = !editableCard;

    if (editableCard) {
      addBtn.addEventListener('click', () => {
        if (!Array.isArray(note.sessionTimes[key])) note.sessionTimes[key] = [];
        const newSession = { id: generateId(), day: '', time: '', repeat: 'none' };
        note.sessionTimes[key].push(newSession);
        saveNoteObject(note);

        addSessionRow(sessionsContainer, titles[key], note, key, newSession, true);
      });
    }

    sectionDiv.appendChild(addBtn);
    body.appendChild(sectionDiv);
  });

  // =======================
  // TASKS SECTION
  // =======================
  const tasksSection = document.createElement('div');
  tasksSection.className = 'course-tasks';

  const tasksHeader = document.createElement('div');
  tasksHeader.className = 'course-tasks-header';

  const tasksTitle = document.createElement('h3');
  tasksTitle.textContent = 'Tasks';
  tasksHeader.appendChild(tasksTitle);

  const tasksList = document.createElement('div');
  tasksList.className = 'task-list';

  if (editableCard) {
    const addTaskBtn = document.createElement('button');
    addTaskBtn.type = 'button';
    addTaskBtn.className = 'add-task-btn';
    addTaskBtn.textContent = '+ Add task';
    tasksHeader.appendChild(addTaskBtn);

    addTaskBtn.addEventListener('click', () => {
      if (!Array.isArray(note.tasks)) note.tasks = [];

      const task = {
        id: generateId(),
        text: '',
        day: '',
        month: '',
        repeat: 'none',
        completed: false
      };

      note.tasks.push(task);
      saveNoteObject(note);
      renderTaskRow(task, note, tasksList, true);
    });
  }

  tasksSection.appendChild(tasksHeader);
  tasksSection.appendChild(tasksList);
  body.appendChild(tasksSection);

  // render existing tasks
  const tasks = Array.isArray(note.tasks) ? note.tasks : [];
  tasks.forEach((task) => {
    if (task.repeat === undefined) task.repeat = 'none'; // back-compat
    renderTaskRow(task, note, tasksList, editableCard);
  });

  // hooks
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

function monthNameFromIndex(i) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[i] || '';
}

function updateTaskRowUI(task) {
  const row = document.querySelector(`.task-row[data-task-id="${task.id}"]`);
  if (!row) return;

  const checkbox = row.querySelector('input[type="checkbox"]');
  const text = row.querySelector('.task-text');
  if (checkbox) checkbox.checked = !!task.completed;
  if (text) text.classList.toggle('done', !!task.completed);

  row.classList.toggle('row-completed', !!task.completed);

  const urgencyClasses = ['task-none','task-ok','task-warning','task-critical','task-overdue'];
  urgencyClasses.forEach((cls) => row.classList.remove(cls));

  const monthIndex =
    (task.month === '' || task.month === undefined) ? '' : Number(task.month);
  const cls = getTaskUrgencyClass(task.day, monthIndex);
  row.classList.add(cls);

  const dueLabel = row.querySelector('.task-due');
  if (dueLabel) {
    dueLabel.textContent = formatTaskDueLabel(task.day, monthIndex);
  }

  const pill = row.querySelector('.session-time-pill');
  if (pill) {
    const rep = task.repeat || 'none';
    const repLabel = (rep === 'none') ? 'Does not repeat' : rep.charAt(0).toUpperCase() + rep.slice(1);

    if (task.day && task.month !== '' && task.month !== undefined) {
      pill.textContent = `${task.day} ${monthNameFromIndex(Number(task.month))} · ${repLabel}`;
    } else {
      pill.textContent = `${repLabel}`;
    }
  }
}

function runRepeatRolloverSweep() {
  const notes = loadAllNotes();
  const now = Date.now();
  let changedAny = false;

  for (const note of notes) {
    if (!Array.isArray(note.tasks)) continue;

    for (const task of note.tasks) {
      if (task.repeat === undefined) task.repeat = 'none';
      if (task.completed === undefined) task.completed = false;

      const changed = rolloverRepeatingTaskIfDuePassed(task, now);
      if (changed) {
        changedAny = true;
        updateTaskRowUI(task);
      }
    }
  }

  if (changedAny) {
    saveAllNotes(notes);
  }
}

runRepeatRolloverSweep();
setInterval(runRepeatRolloverSweep, 30 * 1000);

function parseHHMM(timeStr) {
  if (!timeStr) return null;
  const [hh, mm] = timeStr.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return { hh, mm };
}

function weekdayIndex(dayStr) {
  // UI uses Mon..Sun
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayStr] ?? null;
}

// next occurrence based on repeat/day/time
function computeNextSessionResetAt(sessionObj, nowMs = Date.now()) {
  if (!sessionObj || !sessionObj.repeat || sessionObj.repeat === 'none') return null;

  const t = parseHHMM(sessionObj.time);
  const now = new Date(nowMs);

  // DAILY: needs time
  if (sessionObj.repeat === 'daily') {
    if (!t) return null;
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.hh, t.mm, 0, 0);
    if (d.getTime() <= nowMs) d.setDate(d.getDate() + 1);
    return d.getTime();
  }

  // WEEKLY: needs day + time
  if (sessionObj.repeat === 'weekly') {
    const wd = weekdayIndex(sessionObj.day);
    if (wd === null || !t) return null;

    const cur = now.getDay(); // Sun=0..Sat=6
    let delta = (wd - cur + 7) % 7;

    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.hh, t.mm, 0, 0);
    d.setDate(d.getDate() + delta);

    // if it's today but already passed, push to next week
    if (d.getTime() <= nowMs) d.setDate(d.getDate() + 7);
    return d.getTime();
  }

  // MONTHLY/YEARLY: anchor off existing nextResetAt if possible, else fall back to daily/weekly computation
  let base = sessionObj.nextResetAt ? new Date(sessionObj.nextResetAt) : null;

  if (!base) {
    // try to create a base from weekly if possible, else daily
    const fallback = (sessionObj.day && sessionObj.time)
      ? computeNextSessionResetAt({ ...sessionObj, repeat: 'weekly', nextResetAt: null }, nowMs)
      : computeNextSessionResetAt({ ...sessionObj, repeat: 'daily', nextResetAt: null }, nowMs);

    if (!fallback) return null;
    base = new Date(fallback);
  }

  // push forward until it's in the future
  let next = new Date(base);

  while (next.getTime() <= nowMs) {
    if (sessionObj.repeat === 'monthly') next = addMonths(next, 1);
    else if (sessionObj.repeat === 'yearly') next = addYears(next, 1);
    else break;
  }

  // if still not in future, add one more
  if (next.getTime() <= nowMs) {
    if (sessionObj.repeat === 'monthly') next = addMonths(next, 1);
    if (sessionObj.repeat === 'yearly') next = addYears(next, 1);
  }

  return next.getTime();
}


/* =====================================================
   FORM SUBMIT (NOTES PAGE ONLY)
   - Creates sessionTimes with repeat='none'
===================================================== */
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

    // Keep old schedule (back-compat) + create new sessionTimes
    const scheduleBySection = {};
    const sessionTimes = {};

    activeSections.forEach((name) => {
      const row = document.querySelector(`.section-row[data-section="${name}"]`);
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

      sessionTimes[name] = [{
        id: generateId(),
        day: daySel ? daySel.value : '',
        time,
        repeat: 'none'
      }];
    });

    const note = {
      id: generateId(),
      courseName,
      sections: activeSections,
      schedule: scheduleBySection, // old
      sessionTimes,                // new
      tasks: [],
      status: 'notes'
    };

    addNote(note);
    removePlaceholder();
    createCourseCardFromNote(note);
    closeModal();
  });
}

function updateSessionRowUI(sessionObj) {
  const row = document.querySelector(`.session-row[data-session-id="${sessionObj.id}"]`);
  if (!row) return;

  const checkbox = row.querySelector('input[type="checkbox"]');
  const text = row.querySelector('.todo-text');

  if (checkbox) checkbox.checked = !!sessionObj.completed;
  if (text) text.classList.toggle('done', !!sessionObj.completed);

  row.classList.toggle('row-completed', !!sessionObj.completed);
}

function runSessionRepeatRolloverSweep() {
  const notes = loadAllNotes();
  const now = Date.now();
  let changedAny = false;

  for (const note of notes) {
    if (!note.sessionTimes) continue;

    for (const sectionKey of Object.keys(note.sessionTimes)) {
      const arr = note.sessionTimes[sectionKey];
      if (!Array.isArray(arr)) continue;

      for (const sessionObj of arr) {
        if (!sessionObj.repeat || sessionObj.repeat === 'none') continue;

        // if missing nextResetAt, create it
        if (!sessionObj.nextResetAt) {
          sessionObj.nextResetAt = computeNextSessionResetAt(sessionObj, now);
          if (sessionObj.nextResetAt) changedAny = true;
          continue;
        }

        // If reset time has passed → auto reset completion + schedule next
        if (sessionObj.nextResetAt && now >= sessionObj.nextResetAt) {
          sessionObj.completed = false;

          // compute next reset (and ensure it’s in the future)
          sessionObj.nextResetAt = computeNextSessionResetAt(sessionObj, now);

          changedAny = true;
          updateSessionRowUI(sessionObj); // live update if visible
        }
      }
    }
  }

  if (changedAny) saveAllNotes(notes);
}

runSessionRepeatRolloverSweep();
setInterval(runSessionRepeatRolloverSweep, 30 * 1000);

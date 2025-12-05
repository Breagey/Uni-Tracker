/* =====================================================
   ELEMENTS
===================================================== */
const addNoteBtn = document.querySelector('.add-note');
const modal = document.getElementById('note-modal');
const cancelBtn = document.getElementById('cancel-modal');
const noteForm = document.getElementById('note-form');
const courseNameInput = document.getElementById('course-name');
const notesGrid = document.querySelector('.notes-grid');
const optionButtons = document.querySelectorAll('.option-toggle');
const sectionRows = document.querySelectorAll('.section-row');
const hourSelects = document.querySelectorAll('.hour-select');
const minuteSelects = document.querySelectorAll('.minute-select');


/* =====================================================
   BUILD OPTIONS (24H HOURS + 00–59 MINUTES)
===================================================== */
function buildHourOptions(selectEl) {
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
  selectEl.innerHTML = '<option value="">MM</option>';
  for (let m = 0; m < 60; m++) {
    const mm = String(m).padStart(2, '0');
    const opt = document.createElement('option');
    opt.value = mm;
    opt.textContent = mm;
    selectEl.appendChild(opt);
  }
}

// Initialize modal hour/minute dropdowns
hourSelects.forEach(buildHourOptions);
minuteSelects.forEach(buildMinuteOptions);


/* =====================================================
   OPEN / CLOSE MODAL
===================================================== */
function openModal() {
  modal.classList.remove('hidden');
  courseNameInput.value = '';
  resetOptionButtons();
  courseNameInput.focus();
}

function closeModal() {
  modal.classList.add('hidden');
}

addNoteBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);

// Close when clicking outside modal
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});


/* =====================================================
   OPTION TOGGLE BUTTONS (✓ / ✕) + SCHEDULE ENABLE/DISABLE
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

    // default: lectures + tutorials included, seminars excluded
    if (btn.dataset.section === 'seminars') {
      btn.classList.remove('active');
    } else {
      btn.classList.add('active');
    }

    // Reset day/hour/minute in modal
    selects.forEach((sel) => {
      sel.value = '';
    });

    updateOptionButtonText(btn);
    setScheduleEnabledForButton(btn);
  });
}

// Initial setup for option buttons
optionButtons.forEach((btn) => {
  updateOptionButtonText(btn);
  setScheduleEnabledForButton(btn);

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    updateOptionButtonText(btn);
    setScheduleEnabledForButton(btn);
  });
});


/* =====================================================
   HELPERS FOR CARD SESSIONS
===================================================== */
function buildDayOptions(selectEl) {
  selectEl.innerHTML = '<option value="">—</option>';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    selectEl.appendChild(opt);
  });
}

/**
 * Adds a session row to a section on the card:
 * [checkbox] [pill with day/time] [editable text]
 */
function addSessionRow(container, sectionTitle, initialDay = '', initialTime = '') {
  const row = document.createElement('div');
  row.className = 'todo-row session-row';

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  // Time wrapper
  const timeWrapper = document.createElement('div');
  timeWrapper.className = 'session-time-wrapper';

  // Pill (display mode)
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'session-time-pill';

  // Edit box (hidden by default)
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

  // Apply initial values (if any)
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

  // Initial pill text
  updatePillText();

  // Events
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

  // Assemble edit box
  editBox.appendChild(daySelect);
  editBox.appendChild(hourSelect);
  editBox.appendChild(colon);
  editBox.appendChild(minuteSelect);
  editBox.appendChild(doneBtn);

  // Assemble time wrapper
  timeWrapper.appendChild(pill);
  timeWrapper.appendChild(editBox);

  // Editable text
  const editable = document.createElement('div');
  editable.className = 'todo-text';
  editable.contentEditable = 'true';
  editable.setAttribute(
    'data-placeholder',
    `Type ${sectionTitle.toLowerCase()} details or tasks here…`
  );

  // Checkbox behaviour
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      editable.classList.add('done');
    } else {
      editable.classList.remove('done');
    }
  });

  row.appendChild(checkbox);
  row.appendChild(timeWrapper);
  row.appendChild(editable);

  container.appendChild(row);
}


/* =====================================================
   CREATE COURSE CARD (VERTICAL + MULTIPLE SESSIONS)
===================================================== */
function createCourseCard(courseName, sections, scheduleBySection) {
  const card = document.createElement('article');
  card.className = 'course-note';

  const header = document.createElement('header');
  header.className = 'course-note-header';
  header.textContent = courseName;
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'course-note-body';
  card.appendChild(body);

  const titles = {
    lectures: 'Lectures',
    tutorials: 'Tutorials',
    seminars: 'Seminars'
  };

  sections.forEach((key) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'course-section';

    const h3 = document.createElement('h3');
    h3.textContent = titles[key];
    sectionDiv.appendChild(h3);

    // Container for multiple session rows
    const sessionsContainer = document.createElement('div');
    sessionsContainer.className = 'session-list';
    sectionDiv.appendChild(sessionsContainer);

    // Seed first row from modal's chosen day/time (if any)
    const sched = scheduleBySection[key] || {};
    addSessionRow(
      sessionsContainer,
      titles[key],
      sched.day || '',
      sched.time || ''
    );

    // Button to add more times
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

  // Remove placeholder if it exists
  const placeholder = notesGrid.querySelector('.note-placeholder');
  if (placeholder) placeholder.remove();

  // Add card to grid
  notesGrid.appendChild(card);
}


/* =====================================================
   FORM SUBMIT HANDLER
===================================================== */
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

  // Collect default schedule info from the modal (for the first row)
  const scheduleBySection = {};
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
  });

  createCourseCard(courseName, activeSections, scheduleBySection);
  closeModal();
});

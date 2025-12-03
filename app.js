/* =====================================================
   ELEMENTS
===================================================== */
const addNoteBtn = document.querySelector('.add-note');
const modal = document.getElementById('note-modal');
const cancelBtn = document.getElementById('cancel-modal');
const noteForm = document.getElementById('note-form');
const courseNameInput = document.getElementById('course-name');
const notesGrid = document.querySelector('.notes-grid'); // container for cards
const optionButtons = document.querySelectorAll('.option-toggle');


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
   OPTION TOGGLE BUTTONS (✓ / ✕)
===================================================== */
function updateOptionButtonText(btn) {
  const name = btn.dataset.section;
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  btn.textContent = (btn.classList.contains('active') ? '✓ ' : '✕ ') + label;
}

function resetOptionButtons() {
  optionButtons.forEach((btn) => {
    if (btn.dataset.section === 'seminars') {
      btn.classList.remove('active');
    } else {
      btn.classList.add('active');
    }
    updateOptionButtonText(btn);
  });
}

optionButtons.forEach((btn) => {
  updateOptionButtonText(btn);
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    updateOptionButtonText(btn);
  });
});


/* =====================================================
   CREATE COURSE CARD (VERTICAL + EDITABLE)
===================================================== */
function createCourseCard(courseName, sections) {
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

    const todoRow = document.createElement('div');   // div, not label
    todoRow.className = 'todo-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const editable = document.createElement('div');
    editable.className = 'todo-text';
    editable.contentEditable = 'true';
    editable.setAttribute(
      'data-placeholder',
      `Type ${titles[key].toLowerCase()} details or tasks here…`
    );

    // When checkbox is ticked, grey out + strike text
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        editable.classList.add('done');
      } else {
        editable.classList.remove('done');
      }
    });

    todoRow.appendChild(checkbox);
    todoRow.appendChild(editable);
    sectionDiv.appendChild(todoRow);

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

  createCourseCard(courseName, activeSections);
  closeModal();
});

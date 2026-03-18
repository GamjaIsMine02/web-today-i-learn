const tilForm = document.querySelector('#til-form');
const tilList = document.querySelector('#til-list');
const tilDateInput = document.querySelector('#til-date');
const tilTitleInput = document.querySelector('#til-title-input');
const tilContentInput = document.querySelector('#til-content');
const themeToggleButton = document.querySelector('#theme-toggle');

const STORAGE_KEY = 'my-til-theme';

function setTodayAsDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  tilDateInput.value = today;
}

function createTilItem(date, title, content) {
  const article = document.createElement('article');
  article.className = 'til-item';

  const time = document.createElement('time');
  time.dateTime = date;
  time.textContent = date;

  const heading = document.createElement('h3');
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = content;

  article.append(time, heading, paragraph);
  return article;
}

function onTilSubmit(event) {
  event.preventDefault();

  const date = tilDateInput.value;
  const title = tilTitleInput.value.trim();
  const content = tilContentInput.value.trim();

  if (!date || !title || !content) {
    return;
  }

  const newTilItem = createTilItem(date, title, content);
  tilList.prepend(newTilItem);

  tilForm.reset();
  setTodayAsDefaultDate();
  tilTitleInput.focus();
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  themeToggleButton.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

function onThemeToggle() {
  const currentTheme = document.body.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  applyTheme(nextTheme);
  localStorage.setItem(STORAGE_KEY, nextTheme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
  applyTheme(savedTheme);
}

setTodayAsDefaultDate();
initializeTheme();
tilForm.addEventListener('submit', onTilSubmit);
themeToggleButton.addEventListener('click', onThemeToggle);

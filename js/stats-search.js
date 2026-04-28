// ── Stats Input Course Search ──
const StatsSearch = (() => {

  let searchTimeout = null;
  let selectedCourse = null;
  let onSelectCallback = null;

  function init(inputId, dropdownId, onSelect) {
    const input    = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    onSelectCallback = onSelect;

    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = input.value.trim();

      if (q.length < 2) {
        hideDropdown(dropdown);
        selectedCourse = null;
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const results = await API.searchCourses(q);
          const normalised = results.map(API.normaliseCourse);
          showDropdown(dropdown, normalised, input, onSelect);
        } catch {
          hideDropdown(dropdown);
        }
      }, 350);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${dropdownId}`)) {
        hideDropdown(dropdown);
      }
    });
  }

  function showDropdown(dropdown, courses, input, onSelect) {
    dropdown.innerHTML = '';
    if (!courses.length) {
      dropdown.innerHTML = '<div class="stats-search-item"><span class="item-name">No courses found</span></div>';
      dropdown.classList.remove('hidden');
      return;
    }

    courses.slice(0, 6).forEach(course => {
      const item = document.createElement('div');
      item.className = 'stats-search-item';
      item.innerHTML = `
        <span class="item-name">${escapeHtml(course.name)}</span>
        <span class="item-meta">${course.allTees?.length || 0} tees available</span>
      `;
      item.addEventListener('click', () => {
        input.value    = course.name;
        selectedCourse = course;
        hideDropdown(dropdown);
        if (onSelect) onSelect(course);
      });
      dropdown.appendChild(item);
    });

    dropdown.classList.remove('hidden');
  }

  function hideDropdown(dropdown) {
    if (dropdown) dropdown.classList.add('hidden');
  }

  function getSelected() {
    return selectedCourse;
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init, getSelected };
})();
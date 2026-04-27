// ── Storage keys ──
const STORAGE_KEYS = {
  COURSES: 'handicap_courses',
  HI:      'handicap_hi',
};

const Storage = (() => {

  function getCourses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES)) || [];
    } catch {
      return [];
    }
  }

  function saveCourse(course) {
    const courses = getCourses();
    // Check for existing by name (case-insensitive), replace if found
    const idx = courses.findIndex(c => c.name.toLowerCase() === course.name.toLowerCase());
    if (idx !== -1) {
      courses[idx] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }

  function searchCourses(query) {
    if (!query || query.trim().length < 1) return [];
    const q = query.trim().toLowerCase();
    return getCourses().filter(c => c.name.toLowerCase().includes(q));
  }

  function getHI() {
    const val = localStorage.getItem(STORAGE_KEYS.HI);
    return val !== null ? parseFloat(val) : null;
  }

  function saveHI(hi) {
    localStorage.setItem(STORAGE_KEYS.HI, String(hi));
  }

  return { getCourses, saveCourse, searchCourses, getHI, saveHI };
})();

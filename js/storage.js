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

  function deleteCourse(name) {
    const courses = getCourses().filter(
      c => c.name.toLowerCase() !== name.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }

  function saveHI(hi) {
    localStorage.setItem(STORAGE_KEYS.HI, String(hi));
  }

  function getLastCourse() {
    try {
      return JSON.parse(localStorage.getItem('handicap_last_course')) || null;
    } catch {
      return null;
    }
  }

  function saveLastCourse(course) {
    localStorage.setItem('handicap_last_course', JSON.stringify(course));
  }

  function getLastTee(courseName) {
    try {
      const map = JSON.parse(localStorage.getItem('handicap_tees')) || {};
      return map[courseName.toLowerCase()] || null;
    } catch { return null; }
  }

  function saveLastTee(courseName, teeName) {
    try {
      const map = JSON.parse(localStorage.getItem('handicap_tees')) || {};
      map[courseName.toLowerCase()] = teeName;
      localStorage.setItem('handicap_tees', JSON.stringify(map));
    } catch {}
  }

  function clearLastCourse() {
    localStorage.removeItem('handicap_last_course');
  }

  return { getCourses, saveCourse, searchCourses, getHI, saveHI, deleteCourse, getLastCourse, saveLastCourse, clearLastCourse, getLastTee, saveLastTee };
})();

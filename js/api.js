// ── GolfCourse API ──
const API = (() => {

  const BASE_URL = 'https://api.golfcourseapi.com/v1';
  const API_KEY  = 'YKI7GZD4B5FUUENUDPL3GCLF34';

  async function searchCourses(query) {
    const response = await fetch(
      `${BASE_URL}/search?search_query=${encodeURIComponent(query)}`,
      { headers: { 'Authorization': `Key ${API_KEY}` } }
    );
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.courses || [];
  }

  /**
   * Normalise an API course result into the same shape
   * as a manually saved course so the rest of the app
   * doesn't need to know where the data came from.
   *
   * Prefers male tees, falls back to female.
   * Picks the first tee set returned.
   */
  function normaliseCourse(apiCourse) {
    const cleanName = (apiCourse.club_name || '').replace(/\s*\(\d+\)\s*$/, '').trim();
    const baseName  = cleanName;
    const courseSuffix = apiCourse.course_name &&
      !cleanName.toLowerCase().includes(apiCourse.course_name.toLowerCase())
        ? ` – ${apiCourse.course_name}`
        : '';

    const allTees = buildTeeOptions(apiCourse);
    // Default to second longest tee (index 1), fallback to first
    const defaultTee = allTees[1] || allTees[0] || null;

    return {
      _source:    'api',
      name:       baseName + courseSuffix,
      holes:      '18',
      allTees,
      selectedTee: defaultTee,
      stats18: defaultTee ? {
        par: defaultTee.par_total,
        cr:  defaultTee.course_rating,
        sr:  defaultTee.slope_rating,
        estimated: false
      } : null,
      statsFront: defaultTee ? {
        par: Math.round(defaultTee.par_total / 2),
        cr:  defaultTee.front_course_rating || parseFloat((defaultTee.course_rating / 2).toFixed(1)),
        sr:  defaultTee.front_slope_rating  || defaultTee.slope_rating,
        estimated: !defaultTee.front_course_rating
      } : null,
      statsBack: defaultTee ? {
        par: Math.round(defaultTee.par_total / 2),
        cr:  defaultTee.back_course_rating  || parseFloat((defaultTee.course_rating / 2).toFixed(1)),
        sr:  defaultTee.back_slope_rating   || defaultTee.slope_rating,
        estimated: !defaultTee.back_course_rating
      } : null,
    };
  }

  function buildTeeOptions(apiCourse) {
    const male   = apiCourse.tees?.male   || [];
    const female = apiCourse.tees?.female || [];
    const all    = [...male, ...female];

    return all
      // Exclude winter tees
      .filter(t => !t.tee_name?.toLowerCase().includes('winter'))
      // Sort by total_yards descending
      .sort((a, b) => (b.total_yards || 0) - (a.total_yards || 0))
      .map(t => ({
        tee_name:            t.tee_name || 'Standard',
        course_rating:       t.course_rating,
        slope_rating:        t.slope_rating,
        par_total:           t.par_total,
        number_of_holes:     t.number_of_holes,
        total_yards:         t.total_yards,
        front_course_rating: t.front_course_rating || null,
        front_slope_rating:  t.front_slope_rating  || null,
        back_course_rating:  t.back_course_rating  || null,
        back_slope_rating:   t.back_slope_rating   || null,
      }));
  }

  return { searchCourses, normaliseCourse };
})();
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
    const tees = apiCourse.tees?.male?.[0]
               || apiCourse.tees?.female?.[0]
               || null;

    // Strip any trailing number codes e.g. "Bulbury Woods Golf Club (1002886)"
    const cleanName = (apiCourse.club_name || '').replace(/\s*\(\d+\)\s*$/, '').trim();
    const baseName  = cleanName;

    // Only append course name if it adds something not already in the club name
    const courseSuffix = apiCourse.course_name &&
      !cleanName.toLowerCase().includes(apiCourse.course_name.toLowerCase())
        ? ` – ${apiCourse.course_name}`
        : '';

    const apiHoles = tees?.number_of_holes || 18;
    const apiPar   = tees?.par_total       || null;
    const apiCr    = tees?.course_rating   || null;
    const apiSr    = tees?.slope_rating    || null;

    const is9hole  = apiHoles === 9;
    const fullPar  = is9hole ? apiPar * 2 : apiPar;
    const fullCr   = is9hole ? parseFloat((apiCr * 2).toFixed(1)) : apiCr;
    const fullSr   = apiSr;

    const hasFrontBack = !!(tees?.front_course_rating && tees?.back_course_rating);

    return {
      _source: 'api',
      name:    baseName + courseSuffix,
      holes:   '18',
      stats18: {
        par: fullPar, cr: fullCr, sr: fullSr, estimated: false
      },
      statsFront: {
        par: tees?.front_course_rating ? Math.round(fullPar / 2) : Math.round(fullPar / 2),
        cr:  tees?.front_course_rating || parseFloat((fullCr / 2).toFixed(1)),
        sr:  tees?.front_slope_rating  || fullSr,
        estimated: !hasFrontBack
      },
      statsBack: {
        par: tees?.back_course_rating ? Math.round(fullPar / 2) : Math.round(fullPar / 2),
        cr:  tees?.back_course_rating  || parseFloat((fullCr / 2).toFixed(1)),
        sr:  tees?.back_slope_rating   || fullSr,
        estimated: !hasFrontBack
      },
      tees: buildTeeOptions(apiCourse),
      _raw: apiCourse,
    };
  }

  function buildTeeOptions(apiCourse) {
    const options = [];
    const male   = apiCourse.tees?.male   || [];
    const female = apiCourse.tees?.female || [];
    male.forEach(t =>   options.push({ ...t, gender: 'Male' }));
    female.forEach(t => options.push({ ...t, gender: 'Female' }));
    return options;
  }

  return { searchCourses, normaliseCourse };
})();
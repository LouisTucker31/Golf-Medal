// ── Calculator ──
const Calculator = (() => {

  /**
   * Course Handicap formula:
   *   18-hole: Math.round(HI × (SR / 113) + (CR - Par))
   *   9-hole:  Math.round((HI / 2) × (SR / 113) + (CR - Par))
   *
   * @param {number} hi   - Handicap Index
   * @param {number} cr   - Course Rating
   * @param {number} sr   - Slope Rating
   * @param {number} par  - Par for the course (for the selected holes)
   * @param {number} holes - 9 or 18
   * @returns {number} Course handicap (rounded)
   */
  function courseHandicap(hi, cr, sr, par, holes) {
    const hiAdjusted = holes === 9 ? hi / 2 : hi;
    return Math.round(hiAdjusted * (sr / 113) + (cr - par));
  }

  /**
   * Given a course handicap and par, return the gross score ranges
   * for Bronze, Silver, and Gold.
   *
   * Stableford-style offsets relative to course handicap (over/under par):
   *   Gold:   CH - 3  to  CH - 7  (play better than CH by 3–7 shots)
   *   Silver: CH - 2  to  CH + 2  (play to roughly CH)
   *   Bronze: CH + 3  to  CH + 7  (play worse than CH by 3–7 shots)
   *
   * Gross = Par + (CH offset)
   *
   * @param {number} ch   - Course handicap
   * @param {number} par  - Par (9 or 18 hole)
   * @returns {{ gold, silver, bronze }} Each with { low, high } gross scores
   */
  function scoreRanges(ch, par) {
    return {
      gold:   { low: par + ch - 7, high: par + ch - 3 },
      silver: { low: par + ch - 2, high: par + ch + 2 },
      bronze: { low: par + ch + 3, high: par + ch + 7 },
    };
  }

  return { courseHandicap, scoreRanges };
})();

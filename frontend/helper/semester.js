import moment from 'moment';

const ssMonth = 4;
const wsMonth = 10;
const startDay = 1;

export const WS = 'W';
export const SS = 'S';

/**
 * Find when the start of a semester was from a given semester, month and year
 * @param {string} semester
 * @param {int} month
 * @param {int} year
 * @returns {Moment}
 */
function findSemesterStart(semester, month, year) {
    // if we're already in the new year, semester started last year
    if (semester === WS && month < ssMonth) {
        year -= 1;
    }

    return moment().set({
        year,
        month: (semester === WS ? wsMonth : ssMonth) - 1,
        date: startDay,
    });
}

/**
 * A human-readable string for the current year(s) of the semester
 * @param {string} semester
 * @param {int} year
 * @returns {string}
 */
function getYearString(semester, year) {
    return year.toString().substring(2) + (semester === WS ? '/' + (year + 1).toString().substring(2) : '');
}

/**
 * A human-readable string for the current semester
 * @param {string} semester
 * @returns {string}
 */
function getSemesterString(semester) {
    return semester === WS ? 'WS' : 'SS';
}

/**
 * A human-readable string for the current semester + year(s)
 * @param {string} semester
 * @param {int} year
 * @returns {string}
 */
function getFullString(semester, year) {
    return getSemesterString(semester) + ' ' + getYearString(semester, year);
}

/**
 * An object with the calculated semester data from a given moment
 * @param {Moment} date
 * @returns {{semesterStart: *, semester: string, year: number, fullString: string, valueString: string}}
 */
function calculateSemester(date) {
    const year = date.year();
    const month = date.month() + 1; // 0-indexed

    const semester = month >= ssMonth && month < wsMonth ? SS : WS;

    const semesterStart = findSemesterStart(semester, month, year);
    const semesterStartYear = semesterStart.year();

    return {
        semesterStart,
        semester,
        year: semesterStartYear,
        fullString: getFullString(semester, semesterStartYear),
        valueString: semester + '*' + semesterStartYear,
    };
}

/**
 * Calculate the current semester
 * @returns {{semesterStart: *, semester: string, year: number, fullString: string, valueString: string}}
 */
export function current() {
    return calculateSemester(moment());
}

/**
 * Calculate the next semester
 * @returns {{semesterStart: *, semester: string, year: number, fullString: string, valueString: string}}
 */
export function next() {
    return calculateSemester(moment().add(6, 'months'));
}

/**
 * Get full semester info from given type and year
 * @param {string} type
 * @param {string} year
 * @returns {{semesterStart: *, semester: string, year: number, fullString: string, valueString: string}}
 */
export function info(type = WS, year = 2018) {
    return calculateSemester(
        moment()
            .year(year)
            .month((type === WS ? wsMonth : ssMonth) - 1)
    );
}

export default { WS, SS, current, next, info };

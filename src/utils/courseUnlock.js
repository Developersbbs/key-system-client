// utils/courseUnlock.js

/**
 * Checks if all MCQs in all chapters of a course are passed.
 * @param {Object} course - The course object with chapters.
 * @param {Object} user - The user object containing mcqResults.
 * @returns {boolean} - True if all MCQs in the course are passed, false otherwise.
 */
export const isCourseCompleted = (course, user) => {
  if (!course || !user || !user.mcqResults) {
    return false;
  }

  // Iterate through each chapter of the course
  for (const chapter of course.chapters || []) {
    // Check if the chapter has MCQs
    if (chapter.mcqs && chapter.mcqs.length > 0) {
      // Find the user's result for this specific chapter
      const chapterResult = user.mcqResults.find(result => result.chapterId === chapter._id);
      
      // If no result exists or the user did not pass, the course is not completed
      if (!chapterResult || !chapterResult.passed) {
        return false;
      }
    }
    // If the chapter has no MCQs, we consider it automatically "passed"
  }
  // If all chapters with MCQs are passed, the course is completed
  return true;
};

/**
 * Determines the next course ID that should be unlocked.
 * @param {Array} allCourses - List of all available courses.
 * @param {Object} user - The user object.
 * @returns {string|null} - The ID of the next course to unlock, or null if none.
 */
export const getNextUnlockedCourseId = (allCourses, user) => {
    // Sort courses by their index or creation order if needed
    // Assuming courses are already in the desired order in `allCourses`
    // Find the index of the first course that is NOT unlocked
    const firstLockedIndex = allCourses.findIndex(course => !isCourseUnlocked(course._id));

    // If all courses are unlocked, or the list is empty, return null
    if (firstLockedIndex === -1 || allCourses.length === 0) {
        return null;
    }

    const targetCourse = allCourses[firstLockedIndex];

    // If the course before this one is completed, unlock this one
    if (firstLockedIndex === 0) {
        // First course is always potentially unlockable
        return targetCourse._id;
    } else {
         const previousCourse = allCourses[firstLockedIndex - 1];
         if (isCourseCompleted(previousCourse, user)) {
             return targetCourse._id;
         }
    }
    return null; // No course can be unlocked based on current completion
};

/**
 * Saves the unlock status of a course to localStorage.
 * @param {string} courseId - The ID of the course.
 * @param {boolean} isUnlocked - True if the course is unlocked, false otherwise.
 */
export const setCourseUnlocked = (courseId, isUnlocked) => {
  try {
    const unlockData = JSON.parse(localStorage.getItem('courseUnlocks')) || {};
    unlockData[courseId] = isUnlocked;
    localStorage.setItem('courseUnlocks', JSON.stringify(unlockData));
  } catch (error) {
    console.error("Failed to save course unlock status:", error);
  }
};

/**
 * Checks if a course is unlocked based on localStorage.
 * @param {string} courseId - The ID of the course.
 * @returns {boolean} - True if the course is unlocked, false otherwise.
 */
export const isCourseUnlocked = (courseId) => {
  try {
    const unlockData = JSON.parse(localStorage.getItem('courseUnlocks')) || {};
    return unlockData[courseId] === true;
  } catch (error) {
    console.error("Failed to read course unlock status:", error);
    return false;
  }
};

/**
 * Initializes course unlock statuses.
 * The first course is unlocked by default. Others depend on completion.
 * @param {Array} courses - List of all courses.
 * @param {Object} user - The user object.
 */
export const initializeCourseUnlocks = (courses, user) => {
  if (!courses.length) return;

  // Clear existing unlocks for a fresh start (optional)
  // localStorage.removeItem('courseUnlocks');

  // Determine which courses should be unlocked based on completion logic
  courses.forEach((course, index) => {
    let shouldBeUnlocked = false;
    if (index === 0) {
        // First course is unlocked by default
        shouldBeUnlocked = true;
    } else {
        const previousCourse = courses[index - 1];
        shouldBeUnlocked = isCourseCompleted(previousCourse, user);
    }
    setCourseUnlocked(course._id, shouldBeUnlocked);
  });
};
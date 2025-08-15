/**
 * A utility function to create a URL-friendly slug from a string.
 * Example: 'Vierde Divisie A' -> 'vierde-divisie-a'
 * @param {string} str The string to slugify.
 * @returns {string} The slugified string.
 */
function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphen
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

module.exports = { slugify };
export const SUBMIT_ERRORS = {
  invalidUrl: 'Enter a valid GitHub URL — e.g. https://github.com/owner/repo',
  invalidSha: 'Commit SHA must be a 7–40 character hex string (e.g. a1b2c3d). Leave blank to use the latest commit.',
  rateLimit: 'Submission limit reached. Please wait a few minutes before submitting again.',
  repoNotFound: 'Repository not found. Make sure it exists and you have access to it.',
  forbidden: 'You must own or have write access to submit this repository.',
  duplicate: "You've already submitted this exact commit. Try a different commit SHA or repository.",
  generic: 'Something went wrong. Please try again.',
} as const

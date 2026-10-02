export const RESOURCE_AUDIENCES = ['Organizations', 'Volunteers'];

export const RESOURCE_TOPICS = ['Onboarding', 'Screening', 'Recognition', 'Feedback', 'Inclusivity'];

export const RESOURCE_MAX_SIZE = 5 * 1024 * 1024;

export const RESOURCE_EXTENSIONS = ['.pdf', '.docx'];

export function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function resourceFileError(file) {
  if (!file) return '';
  const name = file.name.toLowerCase();
  if (!RESOURCE_EXTENSIONS.some(ext => name.endsWith(ext))) return 'resources.errors.type';
  if (file.size > RESOURCE_MAX_SIZE) return 'resources.errors.size';
  return '';
}

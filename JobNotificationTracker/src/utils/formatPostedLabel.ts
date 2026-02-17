export function formatPostedLabel(days: number): string {
  if (days === 0) {
    return 'Today';
  }

  return days === 1 ? '1 day ago' : `${days} days ago`;
}

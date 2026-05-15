export function parsePermission(value: string): { action: string; subject: string } {
  const separator = value.includes(':') ? ':' : '.';
  const [subject, action] = value.split(separator);
  return { action, subject };
}

export const Actions = ['create', 'read', 'update', 'delete', 'manage'] as const;
export type Action = (typeof Actions)[number];

export const Subjects = [
  'User',
  'Department',
  'Position',
  'Employee',
  'Role',
  'Attendance',
  'All',
] as const;
export type Subject = (typeof Subjects)[number];

// Support both dot and colon separators, and lowercase/pascal case if we want to be flexible,
// but for strict type safety in this project, we'll match the route format.
export type AppPermission = `${Subject}:${Action}` | `${Lowercase<Subject>}.${Action}`;

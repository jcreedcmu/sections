export type NotesDate = {
  year: number,
  month: number,
  day: number,
}

export function parseNotesDate(date: string): NotesDate {
  const parts = date.split('.');
  if (parts.length == 1) return { year: 0, month: 1, day: 1 }; // XXX this is a hack
  return { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
}

import { ParsedItem } from "./notes-lib-pure";

// This is data that I don't want to save inline in my notesfiles, but
// elsewhere. I expect it to be mostly stuff I expect to edit in-gui,
// not from a text editor.
export type SidecarData = {
  rating: Record<string, number>, // key is guid, value is most likely in [-1,2]
}

export type ServerData = {
  items: ParsedItem[],
  sidecar: SidecarData,
}

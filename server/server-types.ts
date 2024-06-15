import { Anomaly, ParsedItem } from "./notes-lib-pure";

export type ServerData = {
  items: ParsedItem[],
  anomalies: Anomaly[],
}

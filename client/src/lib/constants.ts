export const GHANA_COLORS = {
  red: "#CE1126",
  gold: "#FCD116",
  green: "#006B3F"
} as const;

export const REQUEST_STATUS = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  rejected: "Rejected"
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ["application/pdf"];

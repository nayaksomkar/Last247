// Base URL of the Last247 Python backend HTTP API (UI_API_INTEGRATION.md §2).
// Set NEXT_PUBLIC_API_BASE_URL per environment (e.g. the Render URL in
// production). The fallback is the documented local default (PORT=8080).
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
).replace(/\/+$/, "");

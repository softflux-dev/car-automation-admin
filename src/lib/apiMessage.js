export function getApiMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;
  if (typeof payload === "string") return payload;
  if (payload.message && typeof payload.message === "string") return payload.message;
  if (payload.error && typeof payload.error === "string") return payload.error;
  return fallbackMessage;
}


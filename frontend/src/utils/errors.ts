import axios from "axios";

type ApiErrorResponse = {
  message?: unknown;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }
  }

  return error instanceof Error ? error.message : fallback;
}

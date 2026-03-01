export const extractApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (typeof error !== "object" || error == null) {
    return fallback;
  }

  const parsed = error as {
    response?: { data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };

  const errorMessage = parsed.response?.data?.error?.message;
  if (typeof errorMessage === "string" && errorMessage.length > 0) {
    return errorMessage;
  }

  const responseMessage = parsed.response?.data?.message;
  if (typeof responseMessage === "string" && responseMessage.length > 0) {
    return responseMessage;
  }

  if (typeof parsed.message === "string" && parsed.message.length > 0) {
    return parsed.message;
  }

  return fallback;
};

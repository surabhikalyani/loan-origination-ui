/**
 * Normalizes API errors into readable messages.
 */
export function handleApiError(err) {
    console.error("[API Error]", err);

    const status = err.response?.status;
    const apiResponseMsg = err.response?.data?.message;
    const code = err.code;

    let message;

    if (apiResponseMsg) {
        message = apiResponseMsg;
    } else if (status === 400) {
        message = "Your application contains invalid data. Please review and try again.";
    } else if (status === 401) {
        message = "You’re not authorized to perform this action.";
    } else if (status === 404) {
        message = "Requested resource not found.";
    } else if (status === 500) {
        message = "Server error occurred. Please try again later.";
    } else if (code === "ECONNABORTED") {
        message = "Request timed out. Please check your connection.";
    } else if (!status) {
        message = "Network error — unable to connect to the server.";
    } else {
        message = "Unexpected error occurred. Please try again.";
    }
    return new Error(message);
}

/**
 * Fetch wrapper with retry logic for Render cold start (502 Bad Gateway)
 */

interface FetchWithRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const { maxRetries = 3, retryDelay = 2000, onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);

      // Retry on 502 Bad Gateway (Render cold start)
      // Retry on 503 Service Unavailable
      if (response.status === 502 || response.status === 503) {
        throw new Error(`Server temporarily unavailable (${response.status})`);
      }

      // Return successful response (even 4xx errors - those shouldn't retry)
      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Only retry on network errors or 502/503
      const shouldRetry =
        error instanceof TypeError || // Network error
        (error as Error).message.includes('502') ||
        (error as Error).message.includes('503');

      if (!shouldRetry) {
        throw error;
      }

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, error as Error);
      }

      // Wait before retry (exponential backoff)
      const delay = retryDelay * Math.pow(1.5, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

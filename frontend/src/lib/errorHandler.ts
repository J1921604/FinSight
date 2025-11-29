// Error handling infrastructure for FinSight

export class FinSightError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'FinSightError';
  }
}

export class DataLoadError extends FinSightError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATA_LOAD_ERROR', details);
    this.name = 'DataLoadError';
  }
}

export class APIError extends FinSightError {
  constructor(message: string, public statusCode?: number, details?: unknown) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

export class ValidationError extends FinSightError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class ParseError extends FinSightError {
  constructor(message: string, details?: unknown) {
    super(message, 'PARSE_ERROR', details);
    this.name = 'ParseError';
  }
}

// Error handler utility
export const handleError = (error: unknown): FinSightError => {
  if (error instanceof FinSightError) {
    return error;
  }

  if (error instanceof Error) {
    return new FinSightError(error.message, 'UNKNOWN_ERROR', { originalError: error });
  }

  return new FinSightError('An unknown error occurred', 'UNKNOWN_ERROR', { error });
};

// Log error with context
export const logError = (error: unknown, context?: string): void => {
  const finSightError = handleError(error);
  console.error(`[${context || 'FinSight'}] ${finSightError.name}: ${finSightError.message}`, {
    code: finSightError.code,
    details: finSightError.details,
  });
};

// Retry utility for API calls
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw handleError(lastError);
};

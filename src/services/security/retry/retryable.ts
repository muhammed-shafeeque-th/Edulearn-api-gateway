// Types for retry configuration
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
  retryCondition?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, nextDelay: number) => void;
}

// Default configuration
const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  jitter: true,
};

// Default retry conditions for common scenarios
export const RetryConditions = {
  // Retry on any error
  always: () => true,

  // Never retry
  never: () => false,

  // Retry on network-related errors
  networkErrors: (error: any) => {
    return (
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ECONNRESET' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT'
    );
  },

  // Retry on HTTP status codes
  httpStatus: (statusCodes: number[]) => (error: any) => {
    return statusCodes.includes(error?.status || error?.statusCode);
  },

  // Retry on specific error types
  errorTypes: (types: (new (...args: any[]) => Error)[]) => (error: any) => {
    return types.some(Type => error instanceof Type);
  },

  // Combine multiple conditions with OR logic
  any:
    (...conditions: ((error: any, attempt: number) => boolean)[]) =>
    (error: any, attempt: number) =>
      conditions.some(condition => condition(error, attempt)),

  // Combine multiple conditions with AND logic
  all:
    (...conditions: ((error: any, attempt: number) => boolean)[]) =>
    (error: any, attempt: number) =>
      conditions.every(condition => condition(error, attempt)),
};

// Utility function to calculate delay with exponential backoff
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number,
  jitter: boolean
): number {
  const exponentialDelay = Math.min(
    initialDelay * Math.pow(backoffFactor, attempt),
    maxDelay
  );

  if (!jitter) {
    return exponentialDelay;
  }

  // Add jitter (±25% of the delay)
  const jitterAmount = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.max(0, exponentialDelay + jitterAmount);
}

// Sleep utility
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes a function with retry logic using exponential backoff
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration options
 * @returns Promise that resolves with the function result or rejects with the last error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    maxAttempts,
    initialDelay,
    maxDelay,
    backoffFactor,
    jitter,
    retryCondition = RetryConditions.always,
    onRetry,
  } = finalConfig;

  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt or if retry condition fails
      if (attempt === maxAttempts - 1 || !retryCondition(error, attempt)) {
        throw error;
      }

      const delay = calculateDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffFactor,
        jitter
      );

      // Call onRetry callback if provided
      onRetry?.(error, attempt + 1, delay);

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Creates a retry wrapper function with predefined configuration
 *
 * @param config - Default retry configuration
 * @returns A function that applies retry logic to any async function
 */
export function createRetryWrapper(config: Partial<RetryConfig> = {}) {
  return <T>(
    fn: () => Promise<T>,
    overrideConfig?: Partial<RetryConfig>
  ): Promise<T> => {
    const finalConfig = { ...config, ...overrideConfig };
    return withRetry(fn, finalConfig);
  };
}

/**
 * Decorator for adding retry behavior to class methods
 * Supports both sync and async methods, preserves metadata
 *
 * @param config - Retry configuration
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;

    descriptor.value = function (this: any, ...args: any[]) {
      const result = originalMethod.apply(this, args);

      // If the method returns a Promise, wrap it with retry logic
      if (result && typeof result.then === 'function') {
        return withRetry(() => originalMethod.apply(this, args), config);
      }

      // For sync methods, wrap in a Promise and apply retry
      return withRetry(
        () => Promise.resolve(originalMethod.apply(this, args)),
        config
      );
    } as T;

    // Preserve original method name and other properties
    Object.defineProperty(descriptor.value, 'name', {
      value: originalMethod.name,
      configurable: true,
    });

    return descriptor;
  };
}

/**
 * Alternative decorator that only applies retry to async methods
 * More performant for methods that are definitely async
 */
export function AsyncRetry(config: Partial<RetryConfig> = {}) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;

    descriptor.value = function (this: any, ...args: any[]): Promise<any> {
      return withRetry(() => originalMethod.apply(this, args), config);
    } as T;

    // Preserve original method name
    Object.defineProperty(descriptor.value, 'name', {
      value: originalMethod.name,
      configurable: true,
    });

    return descriptor;
  };
}

// Example usage and configurations
export const CommonRetryConfigs = {
  // Quick retries for transient issues
  quick: {
    maxAttempts: 3,
    initialDelay: 500,
    maxDelay: 2000,
    backoffFactor: 1.5,
    jitter: true,
  },

  // Standard retry for most use cases
  standard: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true,
  },

  // Patient retry for critical operations
  patient: {
    maxAttempts: 10,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffFactor: 1.8,
    jitter: true,
  },

  // Network-specific retry
  network: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 15000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: RetryConditions.networkErrors,
  },

  // HTTP retry for server errors
  httpServerErrors: {
    maxAttempts: 4,
    initialDelay: 1500,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: RetryConditions.httpStatus([500, 502, 503, 504]),
  },
};

// Usage Examples:

// Basic usage
/*
  const result = await withRetry(async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  });
  */

// With custom configuration
/*
  const result = await withRetry(
    () => apiCall(),
    {
      maxAttempts: 5,
      initialDelay: 2000,
      retryCondition: RetryConditions.httpStatus([429, 500, 502, 503]),
      onRetry: (error, attempt, delay) => {
        console.log(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms`);
      }
    }
  );
  */

// Using predefined configurations
/*
  const result = await withRetry(() => apiCall(), CommonRetryConfigs.network);
  */

// Creating a reusable retry wrapper
/*
  const retryWrapper = createRetryWrapper(CommonRetryConfigs.standard);
  const result = await retryWrapper(() => apiCall());
  */

// Using as a decorator - Multiple examples:

// 1. Basic decorator usage
/*
  class ApiService {
    @Retry(CommonRetryConfigs.network)
    async fetchData() {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
    
    @AsyncRetry({ maxAttempts: 3, initialDelay: 1000 })
    async uploadFile(file: File) {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    }
  }
  */

// 2. Database service example
/*
  class DatabaseService {
    @Retry({
      maxAttempts: 5,
      initialDelay: 2000,
      retryCondition: RetryConditions.any(
        RetryConditions.networkErrors,
        (error) => error.message.includes('connection timeout')
      ),
      onRetry: (error, attempt, delay) => {
        console.log(`DB query failed (attempt ${attempt}): ${error.message}`);
        console.log(`Retrying in ${delay}ms...`);
      }
    })
    async executeQuery(query: string, params: any[]) {
      // Database query logic here
      return await this.db.query(query, params);
    }
    
    @Retry(CommonRetryConfigs.patient)
    async performMigration() {
      // Critical migration that needs patient retry
      return await this.db.migrate();
    }
  }
  */

// 3. External API service example
/*
  class ExternalApiService {
    @AsyncRetry({
      maxAttempts: 4,
      initialDelay: 1500,
      retryCondition: RetryConditions.httpStatus([429, 500, 502, 503, 504]),
      onRetry: (error, attempt, delay) => {
        if (error.status === 429) {
          console.log(`Rate limited. Waiting ${delay}ms before retry ${attempt}`);
        } else {
          console.log(`Server error ${error.status}. Retry ${attempt} in ${delay}ms`);
        }
      }
    })
    async callThirdPartyApi(endpoint: string, data: any) {
      const response = await fetch(`https://api.external.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }
      
      return response.json();
    }
  }
  */

// 4. Microservice communication example
/*
  class OrderService {
    @Retry(CommonRetryConfigs.network)
    async notifyPaymentService(orderId: string, amount: number) {
      return await this.httpClient.post('/payment/process', {
        orderId,
        amount
      });
    }
    
    @AsyncRetry({
      maxAttempts: 3,
      initialDelay: 500,
      retryCondition: (error) => {
        // Only retry on specific business logic errors
        return error.code === 'INVENTORY_CHECK_FAILED' || 
               error.code === 'TEMPORARY_UNAVAILABLE';
      }
    })
    async processOrder(order: Order) {
      // Order processing logic with business-specific retry conditions
      return await this.orderProcessor.process(order);
    }
  }
    */

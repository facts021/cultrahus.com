/**
 * Safe API request utility for Cultrahus Sangam 2026.
 * Guarantees that responses (even 502/503/HTML errors or network blinks)
 * are cleanly handled without ever throwing "Unexpected token 'T' / not valid JSON" errors.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export async function safePostJson<T = any>(
  url: string,
  payload: any,
  headers: Record<string, string> = {},
  retries = 1
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      let jsonBody: any = null;

      if (contentType.includes('application/json')) {
        try {
          jsonBody = await res.json();
        } catch {
          jsonBody = null;
        }
      } else {
        // Read text safely to avoid throwing JSON parse error
        await res.text();
      }

      if (!res.ok) {
        // If it's a server 502/503/504 error during container warm-up, retry once
        if (res.status >= 500 && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        const serverError = jsonBody?.error || jsonBody?.message;
        return {
          success: false,
          status: res.status,
          error: serverError || (res.status >= 500
            ? 'The registration server is temporarily warming up. Please click submit again.'
            : `Server returned error (${res.status}). Please try again.`)
        };
      }

      // Success
      return {
        success: true,
        status: res.status,
        data: jsonBody
      };
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }
      return {
        success: false,
        status: 0,
        error: 'Network connection interrupted. Please check your internet connection and try again.'
      };
    }
  }

  return {
    success: false,
    status: 0,
    error: 'Unable to reach the server. Please check your connection and try again.'
  };
}

export async function safeGetJson<T = any>(
  url: string,
  headers: Record<string, string> = {},
  retries = 1
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...headers
        }
      });

      const contentType = res.headers.get('content-type') || '';
      let jsonBody: any = null;

      if (contentType.includes('application/json')) {
        try {
          jsonBody = await res.json();
        } catch {
          jsonBody = null;
        }
      } else {
        await res.text();
      }

      if (!res.ok) {
        if (res.status >= 500 && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        const serverError = jsonBody?.error || jsonBody?.message;
        return {
          success: false,
          status: res.status,
          error: serverError || `Failed to fetch data (${res.status}).`
        };
      }

      return {
        success: true,
        status: res.status,
        data: jsonBody
      };
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }
      return {
        success: false,
        status: 0,
        error: 'Network connection interrupted. Please check your internet connection.'
      };
    }
  }

  return {
    success: false,
    status: 0,
    error: 'Unable to connect to server.'
  };
}

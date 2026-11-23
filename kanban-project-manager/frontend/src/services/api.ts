export type ApiError = {
  error: string;
  message?: string;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    input: string,
    init: RequestInit = {}
  ): Promise<T> {
    const url = this.baseUrl + input;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...init.headers,
    };

    const response = await fetch(url, { ...init, headers, credentials: "include" });

    if (!response.ok) {
      let errorBody: ApiError = { error: "Request failed" };
      try {
        errorBody = (await response.json()) as ApiError;
      } catch {
        errorBody = { error: `HTTP ${response.status}` };
      }
      throw new Error(errorBody.error || errorBody.message || "Request failed");
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(input: string, init?: RequestInit) {
    return this.request<T>(input, { ...init, method: "GET" });
  }

  post<T>(input: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(
      input,
      { ...init, method: "POST", body: body ? JSON.stringify(body) : undefined }
    );
  }

  put<T>(input: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(
      input,
      { ...init, method: "PUT", body: body ? JSON.stringify(body) : undefined }
    );
  }

  patch<T>(input: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(
      input,
      { ...init, method: "PATCH", body: body ? JSON.stringify(body) : undefined }
    );
  }

  delete<T>(input: string, init?: RequestInit) {
    return this.request<T>(input, { ...init, method: "DELETE" });
  }
}

export const api = new ApiClient("");

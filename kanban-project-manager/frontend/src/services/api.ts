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

    let token = "";
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auth-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.state?.token || "";
        }
      } catch {
        // ignore storage parse error
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) || {}),
    };

    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

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

  const API_URL = import.meta.env.VITE_API_URL;

  const getToken = () => localStorage.getItem("token");

  const handleResponse = async (res: Response) => {
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Non-JSON response:", text);
      throw new Error("Server returned invalid response");
    }
    if (!res.ok) {
      throw new Error(data.message || data.error || "API Error");
    }

    return data;
  };

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

  export const api = {
  get: async (url: string) => {
    const res = await fetch(`${API_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return handleResponse(res);
  },

  post: async (url: string, body: any) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    return handleResponse(res);
  },

  put: async (url: string, body: any) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    return handleResponse(res);
  },

  delete: async (url: string) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return handleResponse(res);
  },
};

export const client = async (
  url: string,
  options: RequestInit = {}
) => {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  return handleResponse(res);
};
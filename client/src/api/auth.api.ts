const API_URL = import.meta.env.VITE_API_URL;

type LoginPayload = {
  email: string;
  password: string;
};

export type StudentLoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    role: "student";
    full_name: string;
    email: string;
  };
};

export type AdminLoginResponse = {
  message: string;
  requires2FA: true;
  tempToken: string;
};

// 👤 STUDENT LOGIN
export const studentLogin = async (
  data: LoginPayload
): Promise<StudentLoginResponse> => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};

// 🧑‍💼 ADMIN LOGIN
export const adminLogin = async (
  data: LoginPayload
): Promise<AdminLoginResponse> => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};

export const verify2FA = async (code: string) => {
  const tempToken = localStorage.getItem("temp_token");

  const res = await fetch(`${API_URL}/api/auth/verify-2fa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({ code }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "2FA failed");
  }

  return result;
};
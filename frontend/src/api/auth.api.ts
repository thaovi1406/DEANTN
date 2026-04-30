import { API_BASE_URL } from "../config/api";

export async function sendOtp(email: string) {
  const res = await fetch(`${API_BASE_URL}/send-otp/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return res.json();
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(`${API_BASE_URL}/verify-otp/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  return res.json();
}
export const otpStore = new Map<
  number,
  { code: string; expiresAt: number }
>();
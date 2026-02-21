interface JwtPayload {
  sub?: string;
  exp?: number;
  role?: string;
}

const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload as JwtPayload;
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token: string): string | null => {
  const payload = parseJwtPayload(token);
  return payload?.sub ?? null;
};

export const isAdminToken = (token: string): boolean => {
  const payload = parseJwtPayload(token);
  return payload?.role === "ADMIN";
};

export const isExpiredToken = (token: string): boolean => {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
};

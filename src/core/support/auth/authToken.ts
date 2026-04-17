interface JwtPayload {
  sub?: string;
  exp?: number;
  role?: string;
}

const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // JSON.parse 결과를 JwtPayload로 단언 — JWT 스펙에 따른 구조
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

export const clearAuthData = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
};

export const checkIsAdmin = (): boolean => {
  const token = localStorage.getItem("accessToken");
  return token ? isAdminToken(token) : false;
};

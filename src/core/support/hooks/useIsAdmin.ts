import { checkIsAdmin } from "../auth/authToken";

export function useIsAdmin(): boolean {
  return checkIsAdmin();
}

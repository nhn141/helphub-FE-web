import { refreshSession, type AuthResponse } from "./api";

export type StoredSession = AuthResponse & {
  savedAt: number;
};

const SESSION_STORAGE_KEY = "helphub.auth.session";

export function saveSession(session: AuthResponse): StoredSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const storedSession: StoredSession = {
    ...session,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(storedSession),
  );

  return storedSession;
}

export function readSession(): StoredSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredSession;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  if (canUseStorage()) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function getAccessTokenExpiry(session: StoredSession): number {
  const seconds = session.expiresIn ?? session.accessTokenExpiresIn ?? 900;
  const ms = seconds > 10_000_000 ? seconds : seconds * 1000;
  return session.savedAt + ms;
}

export function isAccessTokenExpired(
  session: StoredSession,
  skewMs = 30_000,
): boolean {
  return Date.now() + skewMs >= getAccessTokenExpiry(session);
}

// Biến module-level lưu Promise của request refresh đang thực thi (single-flight pattern).
// Tránh việc nhiều component/request gọi refresh đồng thời làm phát sinh lỗi token rotation ở Backend.
let activeRefreshPromise: Promise<StoredSession | null> | null = null;

export async function getValidSession(): Promise<StoredSession | null> {
  // 1. Nếu đang có một tiến trình refresh in-flight, dùng chung Promise đó
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  const session = readSession();

  if (!session) {
    return null;
  }

  // 2. Token còn hạn thì trả về ngay
  if (!isAccessTokenExpired(session)) {
    return session;
  }

  // 3. Khởi tạo single-flight refresh Promise để gom các request đồng thời
  activeRefreshPromise = (async () => {
    try {
      const refreshed = await refreshSession(session.refreshToken);
      return saveSession(refreshed);
    } catch (error) {
      console.warn("Gia hạn phiên đăng nhập thất bại:", error);
      clearSession();
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}


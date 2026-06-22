import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable. Check .env.local");
}

/**
 * Generate JWT token dari user object
 * @param {object} user - { id, email, role }
 * @returns {string} JWT token
 */
export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifikasi dan decode JWT token
 * @param {string} token
 * @returns {object|null} decoded payload atau null kalau invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Ambil token dari request header Authorization
 * @param {Request} request
 * @returns {string|null}
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Coba ambil dari cookie juga
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("="))
    );
    return cookies["auth_token"] || null;
  }

  return null;
}

/**
 * Middleware helper: validasi request dan return user
 * @param {Request} request
 * @returns {{ user: object }|{ error: string, status: number }}
 */
export function requireAuth(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: "Unauthorized. Token tidak ditemukan.", status: 401 };
  }

  const user = verifyToken(token);
  if (!user) {
    return { error: "Unauthorized. Token tidak valid atau sudah expired.", status: 401 };
  }

  return { user };
}

/**
 * Middleware helper: validasi request dan pastikan role admin
 * @param {Request} request
 * @returns {{ user: object }|{ error: string, status: number }}
 */
export function requireAdmin(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth;

  if (auth.user.role !== "admin") {
    return { error: "Forbidden. Hanya admin yang bisa mengakses endpoint ini.", status: 403 };
  }

  return { user: auth.user };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // bcryptjs dan jsonwebtoken tidak kompatibel dengan Edge Runtime
  // harus di-mark sebagai server-only external package
  serverExternalPackages: ["bcryptjs", "jsonwebtoken"],
};

export default nextConfig;

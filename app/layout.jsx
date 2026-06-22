import "./globals.css";

export const metadata = {
  title: "ApiStore — Powerful APIs for Your Project",
  description:
    "Beli akses API siap pakai. Dapatkan API key, mulai integrasi dalam hitungan menit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

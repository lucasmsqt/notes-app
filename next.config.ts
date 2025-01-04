import type { NextConfig } from "next";

module.exports = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.API_URL}/auth/:path*`
      },
      {
        source: '/contas/:path*',
        destination: `${process.env.API_URL}/contas/:path*`
      },
      {
        source: '/emprestimos/:path*',
        destination: `${process.env.API_URL}/emprestimos/:path*`
      },
    ];
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

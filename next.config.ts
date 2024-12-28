import type { NextConfig } from "next";
import dotenv from 'dotenv'

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
    ];
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

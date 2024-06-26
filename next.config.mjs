/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  publicRuntimeConfig: {
    redirectUri: process.env.REDIRECT_URI || "http://localhost:3000",
  },
};

export default nextConfig;

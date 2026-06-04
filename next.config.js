/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.GITHUB_PAGES === "true" ? "export" : undefined,
  basePath: process.env.GITHUB_PAGES === "true" ? "/ai-ecommerce-ops" : "",
  images: { unoptimized: true },
};

module.exports = nextConfig;

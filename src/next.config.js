/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // This tells Next.js to load JS/CSS from /try/_next/
    assetPrefix: '/try',
    // This ensures internal links work correctly
    basePath: '/try',
}

module.exports = nextConfig
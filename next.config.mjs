/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/sean-cms",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

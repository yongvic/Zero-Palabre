/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules",
          "C:\\pagefile.sys",
          "C:\\swapfile.sys",
          "C:\\hiberfil.sys",
          "C:\\DumpStack.log.tmp",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    domains: [
      "fszyjfcm6dfwlrlj.public.blob.vercel-storage.com",
      "picsum.photos",
    ],
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Removed deprecated 'domains' array
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ckc2car.com",
        pathname: "/**", // Allow all paths, not just /uploads/**
      },
      {
        protocol: "https",
        hostname: "ckc2car.com",
        pathname: "/**", // Allow all paths, not just /uploads/**
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net", // This covers all Facebook CDN subdomains
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.fbsbx.com", // This covers all Facebook secure subdomains
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.fbkk29-1.fna.fbcdn.net", // Specific Facebook CDN
        pathname: "/**",
      },
      // ✅ Add more Facebook CDN patterns if needed
      {
        protocol: "https",
        hostname: "scontent.**.fbcdn.net", // Generic Facebook content CDN
        pathname: "/**",
      },
      // ✅ Add support for other common image CDNs if needed
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "profile.line-scdn.net",
        pathname: "/**",
      },
    ],
    // ✅ Handle broken images gracefully
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // ✅ Keep optimization enabled for better performance
    unoptimized: false,
    // ✅ Add image formats for better optimization
    formats: ["image/webp", "image/avif"],
    // ✅ Add device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // ✅ Add image sizes for different use cases
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // ✅ Handle static file serving
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: "/images/:path*",
      },
    ];
  },
  // ✅ Add experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },
};

export default nextConfig;

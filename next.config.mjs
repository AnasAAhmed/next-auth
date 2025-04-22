/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            hostname: "lh3.googleusercontent.com",
          },
          {
            hostname: "ui-avatars.com",
          },
        ],
    
      },
};

export default nextConfig;

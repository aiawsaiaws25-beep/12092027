/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS || process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'gh-pages' || process.env.NODE_ENV === 'production';
const repoName = '12092027';

const nextConfig = {
  output: isGithubPages ? 'export' : undefined,
  basePath: process.env.GITHUB_ACTIONS ? `/${repoName}` : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      }
    ],
  },
};

export default nextConfig;

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'efsyuhdiqfwivwjijtpl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/attachments/**',
      },
    ],
  },
};

export default nextConfig;

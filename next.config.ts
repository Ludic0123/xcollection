import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ルーター・キャッシュを無効化（投稿後すぐに反映されるように）
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

export default nextConfig;

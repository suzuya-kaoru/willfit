/** @type {import('next').NextConfig} */
const nextConfig = {
  // 本番ビルドではTypeScriptエラーをチェック
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== "production",
  },

  // 本番では画像最適化を有効化
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
  },

  // 本番ビルド最適化
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // キャッシュ設定
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;

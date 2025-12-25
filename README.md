# WillFit - Workout Tracker App

トレーニング記録・管理 Web アプリケーション

## ✨ 特徴

- **モバイルファースト設計** - ジムでスマホ片手に使える UI
- **週間スケジュール管理** - 曜日ごとのトレーニングプラン設定
- **進捗の可視化** - カレンダー表示、グラフ分析
- **体重・種目別記録** - 成長を数値で追跡

## 🖥️ 画面構成

| 画面 | パス | 説明 |
|------|------|------|
| ダッシュボード | `/` | 今日の予定、週間進捗 |
| トレーニング実行 | `/workout/[menuId]` | セット入力、タイマー |
| 履歴 | `/history` | カレンダー、リスト表示 |
| 分析 | `/analytics` | 体重推移、種目別成長 |
| 設定 | `/settings` | メニュー・種目・体重管理 |

## 🚀 クイックスタート

### 前提条件

- Docker & Docker Compose
- Node.js 20+（ローカル開発用）
- Make（オプション）

### セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd willfit

# 初期セットアップ（初回のみ）
make init

# 開発サーバー起動
make up
```

アプリケーション: http://localhost:3000  
ヘルスチェック: http://localhost:3000/api/health

## 🛠️ 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.0.10 | App Router フレームワーク |
| React | 19.2.0 | UI ライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 4.1.9 | スタイリング |
| shadcn/ui | - | UI コンポーネント |
| Recharts | latest | グラフ描画 |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Prisma | 7.2.0 | ORM |
| MySQL | 8.x | データベース |

### 開発ツール

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Biome | 2.3.10 | Linter / Formatter |
| Docker Compose | - | コンテナ管理 |

## 📋 コマンド一覧

### Make コマンド

```bash
make help       # コマンド一覧表示
make init       # 初期セットアップ
make up         # 開発サーバー起動
make down       # コンテナ停止
make restart    # 再起動
make logs       # ログ表示
make clean      # ビルド成果物クリーン
```

### データベース操作

```bash
make db-seed    # シードデータ投入
make db-reset   # DB リセット + シード
make db-studio  # Prisma Studio 起動
make health     # ヘルスチェック
```

### npm スクリプト

```bash
npm run dev         # 開発サーバー起動
npm run build       # 本番ビルド
npm run type-check  # TypeScript 型チェック
npm run lint        # Biome lint
npm run format      # Biome format
npm run check       # Biome check (lint + format)
```

## 📁 ディレクトリ構造

```
willfit/
├── app/                    # Next.js App Router
│   ├── _actions/          # Server Actions
│   ├── _components/       # ページ固有の Client Component
│   ├── api/               # API Routes
│   ├── analytics/         # 分析画面
│   ├── history/           # 履歴画面
│   ├── settings/          # 設定画面
│   ├── workout/           # ワークアウト実行画面
│   ├── layout.tsx
│   └── page.tsx           # ダッシュボード
├── components/            # 共通 UI コンポーネント
│   └── ui/               # shadcn/ui
├── lib/                   # ユーティリティ
│   ├── db/               # Prisma クライアント・クエリ
│   ├── types.ts          # 型定義
│   └── utils.ts          # ヘルパー関数
├── prisma/                # Prisma スキーマ・シード
├── docker/                # Docker 設定
├── docker-compose.yml
├── Makefile
└── package.json
```

## 🔧 環境変数

`.env` ファイルを作成：

```env
# Database (Docker 環境用)
PRISMA_DATABASE_URL=mysql://docker:docker@db:3306/willfit

# ローカル接続用（Prisma Studio など）
# PRISMA_DATABASE_URL=mysql://docker:docker@127.0.0.1:3306/willfit
```

## 📊 データベース

### エンティティ概要

| テーブル | 説明 |
|----------|------|
| users | ユーザー |
| exercises | 種目 |
| workout_menus | トレーニングメニュー |
| workout_records | セッション記録 |
| workout_set_records | セットごとの記録 |
| weight_records | 体重記録 |
| week_schedules | 週間スケジュール |

### スキーマ操作

```bash
# スキーマを DB に反映
docker compose exec node npm run db:push

# Prisma Studio でデータ確認
make db-studio
```

## 🐛 トラブルシューティング

### DB に接続できない

```bash
docker compose ps      # コンテナ状態確認
docker compose logs db # DB ログ確認
make health            # ヘルスチェック
```

### Prisma クライアントエラー

```bash
docker compose exec node npx prisma generate
```

### 完全クリーンアップ

```bash
make clean
make down
make init
```

## 📝 開発ワークフロー

### 新機能開発

```bash
git checkout -b feature/new-feature
make up
# 開発...
npm run format
npm run type-check
```

### スキーマ変更

```bash
# prisma/schema.prisma を編集
docker compose exec node npm run db:push
```

### 本番デプロイ前

```bash
npm run build
npm run type-check
npm run lint
```

## 📄 ライセンス

Private

## 👥 作成者

k.suzuya

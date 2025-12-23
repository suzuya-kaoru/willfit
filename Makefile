.PHONY: help init up down restart logs db-reset db-seed db-studio health clean

# デフォルトターゲット: ヘルプ表示
help:
	@echo "利用可能なコマンド:"
	@echo "  make init       - 初期セットアップ（クリーン + ビルド + 起動）"
	@echo "  make up         - 開発サーバーを起動"
	@echo "  make down       - コンテナを停止"
	@echo "  make restart    - コンテナを再起動"
	@echo "  make logs       - ログを表示"
	@echo "  make db-reset   - DBをリセットしてシード実行"
	@echo "  make db-seed    - シードデータを投入"
	@echo "  make db-studio  - Prisma Studio起動"
	@echo "  make health     - ヘルスチェック"
	@echo "  make clean      - ビルド成果物をクリーン"

init:
	rm -rf .next
	rm -rf node_modules
	rm -rf package-lock.json
	docker compose build
	docker compose run --rm node npm install
	docker compose run --rm node npx prisma generate
	@make up

up:
	docker compose up -d
	docker compose exec node npm run dev-debug

down:
	docker compose down

restart:
	@make down
	@make up

logs:
	docker compose logs -f node

db-reset:
	docker compose exec node npm run db:reset

db-seed:
	docker compose exec node npm run db:seed

db-studio:
	docker compose exec node npm run db:studio

health:
	@echo "ヘルスチェック中..."
	@curl -s http://localhost:3000/api/health | jq . || echo "アプリが起動していません"

clean:
	rm -rf .next
	rm -rf node_modules
	rm -rf package-lock.json

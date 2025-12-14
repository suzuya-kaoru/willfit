up:
	docker compose up -d
	docker compose exec node npm run dev-debug

down:
	docker compose down

re-up:
	rm -rf .next
	docker compose down
	docker compose build
	docker compose up -d

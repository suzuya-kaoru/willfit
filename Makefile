init:
	rm -rf .next
	rm -rf node_modules
	rm -rf package-lock.json
	docker compose build
	docker compose run --rm node npm install
	@make up

up:
	docker compose up -d
	docker compose exec node npm run dev-debug

down:
	docker compose down

re-install:
	rm -rf .next
	rm -rf node_modules
	rm -rf package-lock.json
	docker compose run --rm node npm install

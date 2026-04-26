## Atalhos de desenvolvimento

up:
	docker compose up --build

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f

be:
	docker compose exec backend sh

fe:
	docker compose exec frontend sh

db:
	docker compose exec db psql -U postgres

migrate:
	docker compose exec backend rails db:migrate

console:
	docker compose exec backend rails console

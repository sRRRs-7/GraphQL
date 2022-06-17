POSTRGRES_URL="postgresql://root:secret@localhost:5432/GraphQL?sslmode=disable"
REDIS_URL="redis://default:secret@localhost:6379"

postgres:
	docker run --name GraphQL -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:14-alpine

createdb:
	docker exec -it GraphQL createdb --username=root --owner=root GraphQL

dropdb:
	docker exec -it GraphQL dropdb GraphQL

pgsql:
	docker exec -it GraphQL sh

redis:
	docker run --name redis7 -p 6379:6379 -d redis:7.0-alpine

rediscli:
	docker exec -it redis7 sh

migration:
	npx typeorm migration:create "src/migrations/fakeFile"

.PHONY: postgres createdb dropdb pgsql redis rediscli
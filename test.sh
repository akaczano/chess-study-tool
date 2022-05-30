docker run -d --rm --name test-data -e POSTGRES_PASSWORD=password -p 5433:5432 postgres
sleep 1
docker cp ./server/db.sql test-data:/
docker exec test-data psql -U postgres -f /db.sql
npm test
docker rm -f test-data

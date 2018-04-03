default: build

clean:

build: 
	docker-compose build

run: 
	-docker-compose down
	docker-compose up -d

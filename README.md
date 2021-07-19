# Wa Project. - Backend Challenge

### Local Requirements

- Docker and Docker Compose

## **Local Initialization**

### Run the commands below only on first startup
```
docker-compose up -d db

docker-compose run --rm api npx sequelize db:migrate
```

### Start the API

```
docker-compose up
```

## **Running requests with Insomnia**
# Wa Project. - Backend Challenge

### API docs

https://waprojectapi.herokuapp.com/api-docs

-- --

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

[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Wa%20Project%20API&uri=https%3A%2F%2Fgist.githubusercontent.com%2FGabrielCC163%2Fcad5585422be49dc0ea4e08b69f08ae7%2Fraw%2Fb426c3c018a9593c07ed0bd5cdb00e9723b16095%2Fwa_project_api_requests.json)
## **Run tests**

```
docker-compose run -e NODE_ENV=test --rm --no-deps api yarn test
```

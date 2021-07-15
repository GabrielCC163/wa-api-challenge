## Initialization

- Initialize Sequelize:

        yarn sequelize init

- Change config.json to database.js.

- Create .sequelizerc file.

- Create user migration and execute it:

        yarn sequelize migration:create --name=create-users
        yarn sequelize db:migrate

- Start the application

### Jest Setup

    yarn add jest sqlite3 dotenv supertest -D
    yarn jest --init

- Apply some changes into jest.config.js

- Create pretest, test and posttest scripts into package.json.

- Execute tests:

        yarn test

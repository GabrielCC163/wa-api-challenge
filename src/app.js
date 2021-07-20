require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const routes = require('./routes');

const express = require('express');
const cors = require('cors');

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: "Wa Project API Challenge",
			description: "API documentation",
			contact: {
				name: "Gabriel Brum Rodrigues",
        		email: "gbrum.rodrigues@gmail.com"
			},
			servers: [
				"http://localhost:3000",
				"https://waprojectapi.herokuapp.com/"
			]
		},
	},
	apis: ["./src/routes.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(routes);

app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

module.exports = app;

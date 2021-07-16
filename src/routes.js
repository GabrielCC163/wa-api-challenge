const routes = require('express').Router();

const LaboratoryController = require('./app/controllers/LaboratoryController');

routes.post('/laboratories', LaboratoryController.store);
routes.get('/laboratories', LaboratoryController.index);
routes.get('/laboratories/:id', LaboratoryController.show);
routes.put('/laboratories/:id', LaboratoryController.update);
routes.delete('/laboratories/:id', LaboratoryController.destroy);

routes.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome!',
  });
});

module.exports = routes;

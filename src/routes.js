const routes = require('express').Router();

const LaboratoryController = require('./app/controllers/LaboratoryController');
const ExamController = require('./app/controllers/ExamController');

routes.post('/laboratories', LaboratoryController.store);
routes.get('/laboratories', LaboratoryController.index);
routes.get('/laboratories/:id', LaboratoryController.show);
routes.put('/laboratories/:id', LaboratoryController.update);
routes.delete('/laboratories/:id', LaboratoryController.destroy);
routes.patch('/laboratories/:id', LaboratoryController.associate);

routes.post('/exams', ExamController.store);
routes.get('/exams', ExamController.index);
routes.get('/exams/:name', ExamController.show);
routes.put('/exams/:id', ExamController.update);
routes.delete('/exams/:id', ExamController.destroy);
routes.patch('/exams/:id', ExamController.associate);

routes.post(
  '/bulk/laboratories',
  LaboratoryController.createLaboratories,
);
routes.put(
  '/bulk/laboratories',
  LaboratoryController.updateLaboratories,
);
routes.delete(
  '/bulk/laboratories',
  LaboratoryController.removeLaboratories,
);

routes.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome!',
  });
});

module.exports = routes;

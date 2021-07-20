const routes = require('express').Router();

const LaboratoryController = require('./app/controllers/LaboratoryController');
const ExamController = require('./app/controllers/ExamController');

/**
 * @swagger
 * definitions:
 *  Lab:
 *    type: "object"
 *    required:
 *      - "name"
 *      - "address"
 *    properties:
 *      name:
 *        type: "string"
 *        example: "Lab A"
 *      address:
 *        type: "string"
 *        example: "Jack Street 123"
 *
 *  Exam:
 *    type: "object"
 *    required:
 *      - "name"
 *      - "type"
 *    properties:
 *      name:
 *        type: "string"
 *        example: "Exam A"
 *      type:
 *        type: "string"
 *        example: "type A1"
 *
 *  ExamIds:
 *    type: "object"
 *    required:
 *      - "exam_ids"
 *    properties:
 *      exam_ids:
 *        type: "array"
 *        example: [1, 2, 3]
 *
 *  LabIds:
 *    type: "object"
 *    required:
 *      - "laboratory_ids"
 *    properties:
 *      laboratory_ids:
 *        type: "array"
 *        example: [1, 2, 3]
 *
 *  Laboratories:
 *    type: "object"
 *    required:
 *      - "laboratories"
 *    properties:
 *      laboratories:
 *        type: "array"
 *        example: [{name: "Laboratory A", address: "Street One"}, {name: "Laboratory B", address: "Street Two"}]
 *
 *  UpdateLaboratories:
 *    type: "object"
 *    required:
 *      - "laboratories"
 *    properties:
 *      laboratories:
 *        type: "array"
 *        example: [{id: 1, name: "new name"}, {id: 2, address: "new address"}]
 *
 *  Exams:
 *    type: "object"
 *    required:
 *      - "exams"
 *    properties:
 *      exams:
 *        type: "array"
 *        example: [{name: "Exam A1", type: "A1"}, {name: "Exam B2", type: "B2"}]
 *
 *  UpdateExams:
 *    type: "object"
 *    required:
 *      - "exams"
 *    properties:
 *      exams:
 *        type: "array"
 *        example: [{id: 1, name: "new name"}, {id: 2, type: "new type"}]
 */

/**
 * @swagger
 * /laboratories:
 *  post:
 *    summary: Creates a laboratory
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Lab"
 *    responses:
 *      '201':
 *        description: Created laboratory object.
 *      '400':
 *        description: name is required / address is required / laboratory already exists.
 *      '500':
 *        description: Internal Server Error.
 */
routes.post('/laboratories', LaboratoryController.store);

/**
 * @swagger
 * /laboratories:
 *  get:
 *    summary: Returns all active laboratories
 *    responses:
 *      '200':
 *        description: List of active laboratories.
 *      '404':
 *        description: No laboratory found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.get('/laboratories', LaboratoryController.index);

/**
 * @swagger
 * /laboratories/{id}:
 *  get:
 *    summary: Returns one specific active laboratory with associated exams
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        type: string
 *        description: Lab ID
 *    responses:
 *      '200':
 *        description: Laboratory object with associated exams.
 *      '404':
 *        description: Laboratory not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.get('/laboratories/:id', LaboratoryController.show);

/**
 * @swagger
 * /laboratories/{id}:
 *  put:
 *    summary: Updates a laboratory
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: Lab ID
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Lab"
 *    responses:
 *      '200':
 *        description: Updated laboratory object.
 *      '400':
 *        description: it is required name and / or address to update.
 *      '404':
 *        description: Laboratory not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.put('/laboratories/:id', LaboratoryController.update);

/**
 * @swagger
 * /laboratories/{id}:
 *  delete:
 *    summary: Defines "status" to "false" in one specific active laboratory, removes associated exams.
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        type: string
 *        description: Lab ID
 *    responses:
 *      '204':
 *        description: Laboratory removed with success.
 *      '404':
 *        description: Laboratory not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.delete('/laboratories/:id', LaboratoryController.destroy);

/**
 * @swagger
 * /laboratories/{id}:
 *  patch:
 *    summary: Add / remove exams in a Laboratory
 *    description: If the request comes with IDs 1 and 2 and then comes with only ID 2, so the first time the laboratory was associated with exam 1 and exam 2. The second time, exam 1 was removed from the association.
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: Lab ID
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/ExamIds"
 *    responses:
 *      '200':
 *        description: Laboratory <Lab_Name> updated with <Quantity_Of> active exams
 *      '400':
 *        description: property exam_ids (array) is required / no valid exams to add
 *      '404':
 *        description: Laboratory not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.patch('/laboratories/:id', LaboratoryController.associate);

/**
 * @swagger
 * /exams:
 *  post:
 *    summary: Creates an exam
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Exam"
 *    responses:
 *      '201':
 *        description: Created exam object.
 *      '400':
 *        description: name is required / type is required / exam already exists.
 *      '500':
 *        description: Internal Server Error.
 */
routes.post('/exams', ExamController.store);

/**
 * @swagger
 * /exams:
 *  get:
 *    summary: Returns all active exams
 *    responses:
 *      '200':
 *        description: List of active exams.
 *      '404':
 *        description: No exam found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.get('/exams', ExamController.index);

/**
 * @swagger
 * /exams/{name}:
 *  get:
 *    summary: Returns one specific active exam with associated laboratories
 *    parameters:
 *      - name: name
 *        in: path
 *        required: true
 *        type: string
 *        description: Exam name
 *    responses:
 *      '200':
 *        description: Exam object with associated laboratories.
 *      '404':
 *        description: Exam not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.get('/exams/:name', ExamController.show);

/**
 * @swagger
 * /exams/{id}:
 *  put:
 *    summary: Updates an exam
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: Exam ID
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Exam"
 *    responses:
 *      '200':
 *        description: Updated exam object.
 *      '400':
 *        description: it is required name and / or type to update.
 *      '404':
 *        description: Exam not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.put('/exams/:id', ExamController.update);

/**
 * @swagger
 * /exams/{id}:
 *  delete:
 *    summary: Defines "status" to "false" in one specific active exam, removes associated laboratories.
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        type: string
 *        description: Exam ID
 *    responses:
 *      '204':
 *        description: Exam removed with success.
 *      '404':
 *        description: Exam not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.delete('/exams/:id', ExamController.destroy);

/**
 * @swagger
 * /exams/{id}:
 *  patch:
 *    summary: Associate / disassociate an exam with laboratories
 *    description: If the request comes with IDs 1 and 2 and then comes with only 2, so the first time the exam was associated with lab 1 and lab 2. The second time, lab 1 was removed from the association.
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: Exam ID
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/LabIds"
 *    responses:
 *      '200':
 *        description: Exam <Exam_Name> associated with <Quantity_Of> active laboratories
 *      '400':
 *        description: property laboratory_ids (array) is required / no valid laboratories to associate
 *      '404':
 *        description: Exam not found.
 *      '500':
 *        description: Internal Server Error.
 */
routes.patch('/exams/:id', ExamController.associate);

/**
 * @swagger
 * /bulk/laboratories:
 *  post:
 *    summary: Create more then one laboratory
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Laboratories"
 *    responses:
 *      '201':
 *        description: List of created laboratory objects.
 *      '400':
 *        description: property laboratories (array) is required / empty array (laboratories) / every laboratory must have name and address / the laboratories already exists
 *      '500':
 *        description: Internal Server Error.
 */
routes.post(
  '/bulk/laboratories',
  LaboratoryController.createLaboratories,
);

/**
 * @swagger
 * /bulk/laboratories:
 *  put:
 *    summary: Updates more then one laboratory
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/UpdateLaboratories"
 *    responses:
 *      '200':
 *        description: List of updated laboratory objects.
 *      '400':
 *        description: property laboratories (array) is required / every laboratory must have an id / every laboratory must have name or address
 *      '404':
 *        description: the laboratories do not exists.
 *      '500':
 *        description: Internal Server Error.
 */
routes.put(
  '/bulk/laboratories',
  LaboratoryController.updateLaboratories,
);

/**
 * @swagger
 * /bulk/laboratories:
 *  delete:
 *    summary: Defines "status" to "false" in more then one laboratory, removes associated exams.
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/LabIds"
 *    responses:
 *      '204':
 *        description: Laboratories removed with success.
 *      '400':
 *        description: property laboratory_ids (array of integers) is required / empty array (laboratory_ids [array of integers])
 *      '404':
 *        description: no laboratories found to delete.
 *      '500':
 *        description: Internal Server Error.
 */
routes.delete(
  '/bulk/laboratories',
  LaboratoryController.removeLaboratories,
);

/**
 * @swagger
 * /bulk/exams:
 *  post:
 *    summary: Create more then one exam
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Exams"
 *    responses:
 *      '201':
 *        description: List of created exam objects.
 *      '400':
 *        description: property exams (array) is required / empty array (exams) / every exam must have name and type / the exams already exists
 *      '500':
 *        description: Internal Server Error.
 */
routes.post('/bulk/exams', ExamController.createExams);

/**
 * @swagger
 * /bulk/exams:
 *  put:
 *    summary: Updates more then one exam
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/UpdateExams"
 *    responses:
 *      '200':
 *        description: List of updated exam objects.
 *      '400':
 *        description: property exams (array) is required / every exam must have an id / every exam must have name or type
 *      '404':
 *        description: the exams do not exists.
 *      '500':
 *        description: Internal Server Error.
 */
routes.put('/bulk/exams', ExamController.updateExams);

/**
 * @swagger
 * /bulk/exams:
 *  delete:
 *    summary: Defines "status" to "false" in more then one exa,, removes associated laboratories.
 *    consumes:
 *      - "application/json"
 *    produces:
 *      - "application/json"
 *    parameters:
 *      - in: "body"
 *        name: "body"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/ExamIds"
 *    responses:
 *      '204':
 *        description: Exams removed with success.
 *      '400':
 *        description: property exam_ids (array of integers) is required / empty array (exam_ids [array of integers])
 *      '404':
 *        description: no exams found to delete.
 *      '500':
 *        description: Internal Server Error.
 */
routes.delete('/bulk/exams', ExamController.removeExams);

routes.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome! Check the documentation at /api-docs',
  });
});

module.exports = routes;

const { Exam, Laboratory } = require('../models');

module.exports = {
  async store(req, res) {
    const { name, type } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'name is required',
      });
    }

    if (!type) {
      return res.status(400).json({
        message: 'type is required',
      });
    }

    const examFound = await Exam.findOne({
      where: { name, status: true },
    });

    if (examFound) {
      return res.status(400).json({
        message: `exam ${examFound.name} already exists`,
      });
    }

    try {
      const exam = await Exam.create({
        name,
        type,
      });

      return res.status(201).json(exam);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async index(req, res) {
    try {
      const exams = await Exam.findAll({
        attributes: { exclude: ['status'] },
        where: {
          status: true,
        },
        order: [['id', 'ASC']],
      });

      if (!exams || exams.length === 0) {
        return res.status(404).json({ message: 'no exam found' });
      }

      return res.status(200).json(exams);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async show(req, res) {
    try {
      const { name } = req.params;

      const exam = await Exam.findOne({
        where: {
          name,
          status: true,
        },
        include: {
          association: 'laboratories',
          through: { attributes: [] },
        },
      });

      if (!exam) {
        return res.status(404).json({ message: 'exam not found' });
      }

      return res.status(200).json(exam);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const { name, type } = req.body;

      if (!name && !type) {
        return res.status(400).json({
          message: 'it is required name and / or type to update',
        });
      }

      const updateObj = {};

      if (name) {
        updateObj.name = name;
      }

      if (type) {
        updateObj.type = type;
      }

      const isUpdated = await Exam.update(updateObj, {
        where: { id, status: true },
      });

      if (!isUpdated || isUpdated[0] === 0) {
        return res.status(404).json({ message: 'exam not found' });
      }

      const updatedExam = await Exam.findByPk(id);

      return res.status(200).json(updatedExam);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const exam = await Exam.findOne({
        where: {
          id,
          status: true,
        },
      });

      if (!exam) {
        return res.status(404).json({ message: 'exam not found' });
      }

      await Exam.update({ status: false }, { where: { id } });

      await exam.setLaboratories([]);

      return res.sendStatus(204);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async associate(req, res) {
    try {
      const { id } = req.params;
      const { laboratory_ids } = req.body;

      if (!laboratory_ids || !Array.isArray(laboratory_ids)) {
        return res.status(400).json({
          message: 'property laboratory_ids (array) is required',
        });
      }

      const exam = await Exam.findOne({
        where: {
          id,
          status: true,
        },
      });

      if (!exam) {
        return res.status(404).json({ message: 'exam not found' });
      }

      if (laboratory_ids.length === 0) {
        await exam.setLaboratories([]);

        return res.status(200).json({
          message: `exam ${exam.name} associated with 0 laboratories`,
        });
      }

      const laboratoriesToSet = [];
      for (const labId of [...new Set(laboratory_ids)].filter(
        (el) => typeof el === 'number',
      )) {
        const laboratory = await Laboratory.findOne({
          where: {
            id: labId,
            status: true,
          },
        });

        if (laboratory) {
          laboratoriesToSet.push(labId);
        }
      }

      if (laboratoriesToSet.length === 0) {
        return res.status(400).json({
          message: 'no valid laboratories to associate',
        });
      }

      await exam.setLaboratories(laboratoriesToSet);

      return res.status(200).json({
        message: `exam ${exam.name} associated with ${laboratoriesToSet.length} laboratories`,
      });
    } catch (error) {
      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async createExams(req, res) {
    const t = await sequelize.transaction();
    const { exams } = req.body;

    if (!exams || !Array.isArray(exams)) {
      return res.status(400).json({
        message: 'property exams (array) is required',
      });
    }

    if (exams.length === 0) {
      return res.status(400).json({
        message: 'empty array (exams)',
      });
    }

    // check if all exams have name and type
    if (!checkEveryKeyInArrayObjects(exams, ['name', 'type'])) {
      return res.status(400).json({
        message: 'every exam must have name and type',
      });
    }

    // remove duplicates
    let uniqueExams = removeObjectDuplicatesFromArray(exams, [
      'name',
      'type',
    ]);

    // returns only name and type properties
    uniqueExams = cleanArrayObjects(uniqueExams, ['name', 'type']);

    const examsToAdd = [];

    for (const exam of uniqueExams) {
      const examExists = await Exam.findOne({
        where: {
          name: exam.name,
          status: true,
        },
      });

      if (!examExists) {
        examsToAdd.push(exam);
      }
    }

    if (examsToAdd.length === 0) {
      return res.status(400).json({
        message: 'the exams already exists',
      });
    }

    try {
      const examsAdded = await Exam.bulkCreate(examsToAdd, {
        transaction: t,
      });

      await t.commit();
      return res.status(200).json(examsAdded);
    } catch (error) {
      await t.rollback();

      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async updateExams(req, res) {
    const t = await sequelize.transaction();
    const { exams } = req.body;

    if (!exams || !Array.isArray(exams)) {
      return res.status(400).json({
        message: 'property exams (array) is required',
      });
    }

    // check if all exams have id
    if (!checkEveryKeyInArrayObjects(exams, ['id'])) {
      return res.status(400).json({
        message: 'every exam must have an id',
      });
    }

    // check if all exams have either name or type
    if (!checkIfContainKeysInArrayObjects(exams, ['name', 'type'])) {
      return res.status(400).json({
        message: 'every exam must have name and / or type',
      });
    }

    // remove duplicates
    let uniqueExams = removeObjectDuplicatesFromArray(exams, ['id']);

    uniqueExams = cleanArrayObjects(uniqueExams, [
      'id',
      'name',
      'type',
    ]);

    const examsToUpdate = [];

    for (const exam of uniqueExams) {
      const examExists = await Exam.findByPk(exam.id);

      if (examExists) {
        examsToUpdate.push(exam);
      }
    }

    if (examsToUpdate.length === 0) {
      return res.status(400).json({
        message: 'the exams do not exists',
      });
    }

    try {
      const examPromises = [];
      const examIds = [];

      for (let i = 0; i < examsToUpdate.length; i++) {
        const examId = examsToUpdate[i].id;

        examIds.push(examId);

        delete examsToUpdate[i].id;

        examPromises.push(
          Exam.update(examsToUpdate[i], {
            where: {
              id: examId,
            },
            transaction: t,
          }),
        );
      }

      await Promise.all(examPromises);

      await t.commit();

      const updatedExams = await Exam.findAll({
        where: {
          id: examIds,
        },
      });

      return res.status(200).json(updatedExams);
    } catch (error) {
      await t.rollback();

      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async removeExams(req, res) {
    const t = await sequelize.transaction();

    const { exam_ids } = req.body;

    if (!exam_ids || !Array.isArray(exam_ids)) {
      return res.status(400).json({
        message: 'property exam_ids (array of integers) is required',
      });
    }

    if (exam_ids.length === 0) {
      return res.status(400).json({
        message: 'empty array (exam_ids [array of integers])',
      });
    }

    const examIds = [...new Set(exam_ids)].filter(
      (el) => typeof el === 'number',
    );

    if (examIds.length === 0) {
      return res.status(400).json({
        message: 'no exams found to delete',
      });
    }

    try {
      await Exam.update(
        {
          status: false,
        },
        {
          where: {
            id: examIds,
          },
          transaction: t,
        },
      );

      await sequelize.query(
        `DELETE FROM laboratory_exams WHERE exam_id in (${examIds.join(
          ',',
        )})`,
        { transaction: t },
      );

      await t.commit();

      return res.sendStatus(204);
    } catch (error) {
      await t.rollback();

      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },
};

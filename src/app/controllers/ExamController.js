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
      where: { name },
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

      const examUpdated = await Exam.findByPk(id);

      return res.status(200).json(examUpdated);
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
};

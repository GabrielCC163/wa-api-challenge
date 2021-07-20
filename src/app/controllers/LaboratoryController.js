const {
  removeObjectDuplicatesFromArray,
  checkEveryKeyInArrayObjects,
  checkIfContainKeysInArrayObjects,
  cleanArrayObjects,
} = require('../../utils/ObjectComparator');
const { Laboratory, Exam, sequelize } = require('../models');

const findActiveLabByNameAndAddress = async (name, address) => {
  const lab = await Laboratory.findOne({
    where: { name, address, status: true },
  });

  if (lab) {
    return lab;
  }

  return false;
};

module.exports = {
  async store(req, res) {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'name is required',
      });
    }

    if (!address) {
      return res.status(400).json({
        message: 'address is required',
      });
    }

    const laboratoryFound = await findActiveLabByNameAndAddress(
      name,
      address,
    );

    if (laboratoryFound) {
      return res.status(400).json({
        message: `laboratory ${laboratoryFound.name} already exists`,
      });
    }

    try {
      const laboratory = await Laboratory.create({
        name,
        address,
      });

      return res.status(201).json(laboratory);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async index(req, res) {
    try {
      const laboratories = await Laboratory.findAll({
        attributes: { exclude: ['status'] },
        where: {
          status: true,
        },
        order: [['id', 'ASC']],
      });

      if (!laboratories || laboratories.length === 0) {
        return res
          .status(404)
          .json({ message: 'no laboratory found' });
      }

      return res.status(200).json(laboratories);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      const laboratory = await Laboratory.findOne({
        where: {
          id,
          status: true,
        },
        include: {
          association: 'exams',
          through: { attributes: [] },
        },
      });

      if (!laboratory) {
        return res
          .status(404)
          .json({ message: 'laboratory not found' });
      }

      return res.status(200).json(laboratory);
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
      const { name, address } = req.body;

      if (!name && !address) {
        return res.status(400).json({
          message: 'it is required name and / or address to update',
        });
      }

      const updateObj = {};

      if (name) {
        updateObj.name = name;
      }

      if (address) {
        updateObj.address = address;
      }

      const isUpdated = await Laboratory.update(updateObj, {
        where: { id, status: true },
      });

      if (!isUpdated || isUpdated[0] === 0) {
        return res
          .status(404)
          .json({ message: 'laboratory not found' });
      }

      const updatedLab = await Laboratory.findByPk(id);

      return res.status(200).json(updatedLab);
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

      const laboratory = await Laboratory.findOne({
        where: {
          id,
          status: true,
        },
      });

      if (!laboratory) {
        return res
          .status(404)
          .json({ message: 'laboratory not found' });
      }

      await Laboratory.update({ status: false }, { where: { id } });

      await laboratory.setExams([]);

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
      const { exam_ids } = req.body;

      if (!exam_ids || !Array.isArray(exam_ids)) {
        return res.status(400).json({
          message: 'property exam_ids (array) is required',
        });
      }

      const laboratory = await Laboratory.findOne({
        where: {
          id,
          status: true,
        },
      });

      if (!laboratory) {
        return res
          .status(404)
          .json({ message: 'laboratory not found' });
      }

      if (exam_ids.length === 0) {
        await laboratory.setExams([]);

        return res.status(200).json({
          message: `laboratory ${laboratory.name} updated with 0 exams`,
        });
      }

      const examsToSet = [];

      for (const examId of [...new Set(exam_ids)].filter(
        (el) => typeof el === 'number',
      )) {
        const exam = await Exam.findOne({
          where: {
            id: examId,
            status: true,
          },
        });

        if (exam) {
          examsToSet.push(examId);
        }
      }

      if (examsToSet.length === 0) {
        return res.status(400).json({
          message: 'no valid exams to add',
        });
      }

      await laboratory.setExams(examsToSet);

      return res.status(200).json({
        message: `laboratory ${laboratory.name} updated with ${examsToSet.length} exams`,
      });
    } catch (error) {
      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async createLaboratories(req, res) {
    const t = await sequelize.transaction();
    const { laboratories } = req.body;

    if (!laboratories || !Array.isArray(laboratories)) {
      return res.status(400).json({
        message: 'property laboratories (array) is required',
      });
    }

    if (laboratories.length === 0) {
      return res.status(400).json({
        message: 'empty array (laboratories)',
      });
    }

    // check if all laboratories have name and address
    if (
      !checkEveryKeyInArrayObjects(laboratories, ['name', 'address'])
    ) {
      return res.status(400).json({
        message: 'every laboratory must have name and address',
      });
    }

    // remove duplicates
    let uniqueLabs = removeObjectDuplicatesFromArray(laboratories, [
      'name',
      'address',
    ]);

    // returns only name and address properties
    uniqueLabs = cleanArrayObjects(uniqueLabs, ['name', 'address']);

    const labsToAdd = [];

    for (const lab of uniqueLabs) {
      const labExists = await findActiveLabByNameAndAddress(
        lab.name,
        lab.address,
      );

      if (!labExists) {
        labsToAdd.push(lab);
      }
    }

    if (labsToAdd.length === 0) {
      return res.status(400).json({
        message: 'the laboratories already exists',
      });
    }

    try {
      const labsAdded = await Laboratory.bulkCreate(labsToAdd, {
        transaction: t,
      });

      await t.commit();
      return res.status(201).json(labsAdded);
    } catch (error) {
      await t.rollback();

      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async updateLaboratories(req, res) {
    const t = await sequelize.transaction();
    const { laboratories } = req.body;

    if (!laboratories || !Array.isArray(laboratories)) {
      return res.status(400).json({
        message: 'property laboratories (array) is required',
      });
    }

    // check if all laboratories have id
    if (!checkEveryKeyInArrayObjects(laboratories, ['id'])) {
      return res.status(400).json({
        message: 'every laboratory must have an id',
      });
    }

    // check if all laboratories have either name or address
    if (
      !checkIfContainKeysInArrayObjects(laboratories, [
        'name',
        'address',
      ])
    ) {
      return res.status(400).json({
        message: 'every laboratory must have name and / or address',
      });
    }

    // remove duplicates
    let uniqueLabs = removeObjectDuplicatesFromArray(laboratories, [
      'id',
    ]);

    uniqueLabs = cleanArrayObjects(uniqueLabs, [
      'id',
      'name',
      'address',
    ]);

    const labsToUpdate = [];

    for (const lab of uniqueLabs) {
      const labExists = await Laboratory.findByPk(lab.id);

      if (labExists) {
        labsToUpdate.push(lab);
      }
    }

    if (labsToUpdate.length === 0) {
      return res.status(404).json({
        message: 'the laboratories do not exists',
      });
    }

    try {
      const labPromises = [];
      const labIds = [];

      for (let i = 0; i < labsToUpdate.length; i++) {
        const labId = labsToUpdate[i].id;

        labIds.push(labId);

        delete labsToUpdate[i].id;

        labPromises.push(
          Laboratory.update(labsToUpdate[i], {
            where: {
              id: labId,
            },
            transaction: t,
          }),
        );
      }

      await Promise.all(labPromises);

      await t.commit();

      const updatedLabs = await Laboratory.findAll({
        where: {
          id: labIds,
        },
      });

      return res.status(200).json(updatedLabs);
    } catch (error) {
      await t.rollback();

      if (error.message) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).send(error);
    }
  },

  async removeLaboratories(req, res) {
    const t = await sequelize.transaction();

    const { laboratory_ids } = req.body;

    if (!laboratory_ids || !Array.isArray(laboratory_ids)) {
      return res.status(400).json({
        message:
          'property laboratory_ids (array of integers) is required',
      });
    }

    if (laboratory_ids.length === 0) {
      return res.status(400).json({
        message: 'empty array (laboratory_ids [array of integers])',
      });
    }

    const labIds = [...new Set(laboratory_ids)].filter(
      (el) => typeof el === 'number',
    );

    if (labIds.length === 0) {
      return res.status(400).json({
        message: 'no laboratories found to delete',
      });
    }

    try {
      await Laboratory.update(
        {
          status: false,
        },
        {
          where: {
            id: labIds,
          },
          transaction: t,
        },
      );

      await sequelize.query(
        `DELETE FROM laboratory_exams WHERE laboratory_id in (${labIds.join(
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

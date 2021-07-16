const { Laboratory } = require('../models');

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

    const laboratoryFound = await Laboratory.findOne({
      where: { name, address },
    });

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
        attributes: {exclude: ['status']},
        where: {
          status: true,
        },
        order: [['name', 'ASC']],
      });

      if (!laboratories || laboratories.length === 0) {
        return res
          .status(404)
          .json({ message: 'no laboratory found' });
      }

      return res.status(200).json(laboratories);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({message: error.message})
      }
      
      return res.status(500).send(error);
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      const laboratory = await Laboratory.findByPk(id);

      if (!laboratory) {
        return res
          .status(404)
          .json({ message: 'laboratory not found' });
      }

      return res.status(200).json(laboratory);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({message: error.message})
      }

      return res.status(500).send(error);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      delete req.body.active;

      const isUpdated = await Laboratory.update(req.body, {
        where: { id, status: true },
      });

      if (!isUpdated || isUpdated[0] === 0) {
        return res
          .status(404)
          .json({ message: 'laboratory not found' });
      }

      const laboratoryUpdated = await Laboratory.findByPk(id);

      return res.status(200).json(laboratoryUpdated);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({message: error.message})
      }

      return res.status(500).send(error);
    }
  },

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const isInactivated = await Laboratory.update(
        { status: false },
        { where: { id, status: true } },
      );

      console.log(isInactivated)
      if (!isInactivated || isInactivated[0] === 0) {
        return res
          .status(404)
          .json({ message: 'laboratory not found' });
      }

      return res.sendStatus(204);
    } catch (error) {
      if (error.message) {
        return res.status(500).json({message: error.message})
      }

      return res.status(500).send(error);
    }
  },
};

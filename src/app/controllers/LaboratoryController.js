const { Laboratory } = require("../models");

module.exports = {
  async store(req, res) {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'name is required'
      })
    }

    if (!address) {
      return res.status(400).json({
        message: 'address is required'
      })
    }

    const laboratoryFound = await Laboratory.findOne({
      where: {name}
    });

    if (laboratoryFound) {
      return res.status(400).json({
        message: `laboratory ${laboratoryFound.name} already exists`
      });
    }

    try {
      const laboratory = await Laboratory.create({
        name,
        address
      });

      return res.status(201).json(laboratory)
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async index(req, res) {
    try {
      const laboratories = await Laboratory.findAll({
        order: ['name', 'ASC']
      });

      if (!laboratories || laboratories.length === 0) {
        return res.status(404).json({message: 'no laboratory found'})
      }

      return res.status(200).json(laboratories);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      const laboratory = await Laboratory.findByPk(id);

      if (!laboratory) {
        return res.status(404).json({message: 'laboratory not found'})
      }

      return res.status(200).json(laboratory);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      delete req.body.active;

      const laboratoryUpdated = await Laboratory.update(req.body, {
        where: {id}
      })

      if (!laboratoryUpdated) {
        return res.status(404).json({message: 'laboratory not found'})
      }

      return laboratoryUpdated;
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  
  async destroy(req, res) {
    try {
      
    } catch (error) {
      return res.status(500).send(error);
    }
  }
}
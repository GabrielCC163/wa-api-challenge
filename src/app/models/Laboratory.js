module.exports = (sequelize, DataTypes) => {
  const Laboratory = sequelize.define(
    'laboratory',
    {
      name: DataTypes.STRING,
      address: DataTypes.TEXT('medium'),
      status: DataTypes.BOOLEAN,
    },
    {
      tableName: 'laboratories',
    },
  );

  Laboratory.associate = (models) => {
    Laboratory.belongsToMany(models.exam, {
      foreignKey: 'laboratory_id',
      through: 'laboratory_exams',
      as: 'exams',
    });
  };

  return Laboratory;
};

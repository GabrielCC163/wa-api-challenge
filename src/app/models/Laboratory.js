module.exports = (sequelize, DataTypes) => {
  const Laboratory = sequelize.define(
    'Laboratory',
    {
      name: DataTypes.STRING,
      address: DataTypes.TEXT('medium'),
      status: DataTypes.BOOLEAN,
    },
    {
      tableName: 'laboratories',
      timestamps: false,
    },
  );

  Laboratory.associate = (models) => {
    Laboratory.belongsToMany(models.Exam, {
      foreignKey: 'laboratory_id',
      through: 'laboratory_exams',
      as: 'exams',
    });
  };

  return Laboratory;
};

module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define(
    'exam',
    {
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
    },
    {
      tableName: 'exams',
    },
  );

  Exam.associate = (models) => {
    Exam.belongsToMany(models.laboratory, {
      foreignKey: 'exam_id',
      through: 'laboratory_exams',
      as: 'laboratories',
    });
  };

  return Exam;
};

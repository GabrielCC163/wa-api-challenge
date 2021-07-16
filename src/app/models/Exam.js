module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define(
    'Exam',
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
    Exam.belongsToMany(models.Laboratory, {
      foreignKey: 'exam_id',
      through: 'laboratory_exams',
      as: 'laboratories',
    });
  };

  return Exam;
};

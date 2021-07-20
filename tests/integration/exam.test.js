const request = require('supertest');
const app = require('../../src/app');

const {
  sequelize,
  Exam,
  Laboratory,
} = require('../../src/app/models');

beforeEach(async () => {
  await sequelize.query(`
  delete from laboratory_exams
    where exam_id in (select id from exams where name in (
      'Exam A', 'Exam B', 'Exam C', 'Exam A100', 'Exam UPDT'
    ))
  `);

  await Exam.destroy({
    where: {
      name: ['Exam A', 'Exam B', 'Exam C', 'Exam A100', 'Exam UPDT'],
    },
    force: true,
  });

  await Laboratory.destroy({
    where: {
      id: 20,
    },
    force: true,
  });
});

describe('POST /exams', () => {
  it('should create a exam (201)', async () => {
    const response = await request(app).post('/exams').send({
      name: 'Exam A',
      type: 'A1',
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Exam A');
    expect(response.body.type).toBe('A1');

    const exam = await Exam.findOne({
      where: {
        name: response.body.name,
      },
    });

    expect(exam).toBeDefined();
    expect(exam.status).toBe(true);
  });
});

describe('PUT /exams/:id', () => {
  it('should update a exam (200)', async () => {
    const exam = await Exam.create({
      name: 'Exam UPDT',
      type: 'A1',
    });

    console.log('exam id ', exam.id);
    const response = await request(app)
      .put(`/exams/${exam.id}`)
      .send({
        id: 10,
        type: 'New type',
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Exam UPDT');
    expect(response.body.type).toBe('New type');
  });
});

describe('GET /exams', () => {
  it('should return all ACTIVE exams (200)', async () => {
    await Exam.create({
      name: 'Exam A',
      type: 'type A',
    });

    await Exam.create({
      name: 'Exam B',
      type: 'type B',
    });

    await Exam.create({
      name: 'Exam C',
      type: 'type C',
      status: false,
    });

    const response = await request(app).get('/exams');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe('GET /exams/:name', () => {
  it('should return a single exam (200)', async () => {
    await Exam.create({
      id: 1,
      name: 'Exam A',
      type: 'type A',
    });

    await Exam.create({
      id: 2,
      name: 'Exam B',
      type: 'type B',
    });

    const response = await request(app).get('/exams/Exam A');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.name).toBe('Exam A');
    expect(response.body.type).toBe('type A');
  });
});

describe('DELETE /exams/:id', () => {
  it('should update a exam status to false (204)', async () => {
    await Exam.create({
      id: 1,
      name: 'Exam A',
      type: 'type A',
    });

    const response = await request(app).delete('/exams/1');

    expect(response.status).toBe(204);

    const exam = await Exam.findByPk(1);

    expect(exam.status).toBe(false);
  });
});

describe('PATCH /exams/:id', () => {
  it('should associate a exam to a lab (200)', async () => {
    await Exam.create({
      id: 100,
      name: 'Exam A100',
      type: 'A1',
    });

    await Laboratory.create({
      id: 20,
      name: 'Lab A100',
      address: 'Address A',
    });

    const response = await request(app)
      .patch('/exams/100')
      .send({
        laboratory_ids: [20],
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'exam Exam A100 associated with 1 laboratories',
    );

    const getResponse = await request(app).get('/exams/Exam A100');

    expect(getResponse.body.laboratories.length).toBe(1);
    expect(getResponse.body.laboratories[0].id).toBe(20);
  });
});

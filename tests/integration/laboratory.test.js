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
    where laboratory_id in (select id from laboratories where name in (
      'Lab A', 'Lab B', 'Lab C', 'Laboratory A'
    ))
  `);

  await Laboratory.destroy({
    where: {
      name: ['Lab A', 'Lab B', 'Lab C', 'Laboratory A'],
    },
  });

  await Exam.destroy({
    where: {
      id: 20,
    },
  });
});

describe('POST /laboratories', () => {
  it('should create a laboratory (201)', async () => {
    const response = await request(app).post('/laboratories').send({
      name: 'Lab A',
      address: "Jack's Street, 123, California",
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Lab A');
    expect(response.body.address).toBe(
      "Jack's Street, 123, California",
    );

    const lab = await Laboratory.findOne({
      where: {
        name: response.body.name,
      },
    });

    expect(lab).toBeDefined();
    expect(lab.status).toBe(true);
  });
});

describe('PUT /laboratories/:id', () => {
  it('should update a laboratory (200)', async () => {
    const lab = await Laboratory.create({
      name: 'Lab A',
      address: "Jack's Street, 123, California",
    });

    const response = await request(app)
      .put(`/laboratories/${lab.id}`)
      .send({
        name: 'Laboratory A',
        address: 'New Address',
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Laboratory A');
    expect(response.body.address).toBe('New Address');
  });
});

describe('GET /laboratories', () => {
  it('should return all ACTIVE laboratories (200)', async () => {
    await Laboratory.create({
      name: 'Lab A',
      address: 'address A',
    });

    await Laboratory.create({
      name: 'Lab B',
      address: 'address B',
    });

    await Laboratory.create({
      name: 'Lab C',
      address: 'address C',
      status: false,
    });

    const response = await request(app).get('/laboratories');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe('GET /laboratories/:id', () => {
  it('should return a single lab (200)', async () => {
    await Laboratory.create({
      id: 1,
      name: 'Lab A',
      address: 'address A',
    });

    await Laboratory.create({
      id: 2,
      name: 'Lab B',
      address: 'address B',
    });

    const response = await request(app).get('/laboratories/1');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.name).toBe('Lab A');
    expect(response.body.address).toBe('address A');
  });
});

describe('DELETE /laboratories/:id', () => {
  it('should update a lab status to false (204)', async () => {
    await Laboratory.create({
      id: 1,
      name: 'Lab A',
      address: 'address A',
    });

    const response = await request(app).delete('/laboratories/1');

    expect(response.status).toBe(204);

    const lab = await Laboratory.findByPk(1);

    expect(lab.status).toBe(false);
  });
});

describe('PATCH /laboratories/:id', () => {
  it('should associate a exam to a lab (200)', async () => {
    await Exam.create({
      id: 20,
      name: 'Exam A2',
      type: 'A1',
    });

    await Laboratory.create({
      id: 1,
      name: 'Lab A',
      address: 'address A',
    });

    const response = await request(app)
      .patch('/laboratories/1')
      .send({
        exam_ids: [20],
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'laboratory Lab A updated with 1 exams',
    );

    const getResponse = await request(app).get('/laboratories/1');

    expect(getResponse.body.exams).toHaveLength(1);
    expect(getResponse.body.exams[0].id).toBe(20);
  });
});

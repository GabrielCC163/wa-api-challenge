const request = require('supertest');
const app = require('../../src/app');
const truncate = require('../utils/truncate');

const { Exam, Laboratory } = require('../../src/app/models');

beforeEach(async () => {
    await truncate();
})

describe('POST /laboratories', () => {
    it('should create a laboratory (201)', async () => {
        const response = await request(app)
        .post('/laboratories')
        .send({
            name: "Lab A",
            address: "Jack's Street, 123, California"
        });

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body.name).toBe('Lab A');
        expect(response.body.address).toBe("Jack's Street, 123, California");
        expect(response.body.status).toBe(true);

        const lab = await Laboratory.findOne({
            where: {
                name: response.body.name
            }
        });

        expect(lab).toBeDefined()
    })
})  
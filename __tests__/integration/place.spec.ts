import request from 'supertest';
import faker from 'faker';
import app from '../../src/app';
import conn from '../../src/database/conn';

describe('Place', () => {
  afterAll(() => {
    conn.destroy();
  });

  beforeEach(async () => {
    await conn('places').truncate();
  });

  it('should be able to register', async () => {
    const place = {
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    };

    const response = await request(app).post('/places').send(place);

    expect(response.status).toBe(201);
  });

  it('should not be able to register duplicated places', async () => {
    const place = {
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    };

    await request(app).post('/places').send(place);

    const response = await request(app).post('/places').send(place);

    expect(response.status).toBe(400);
  });

  it('should be able to list places', async () => {
    const place = {
      id: 1,
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    };

    const anotherPlace = {
      id: 2,
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    };

    await request(app).post('/places').send(place);

    await request(app).post('/places').send(anotherPlace);

    const response = await request(app).get('/places');

    expect(response.body).toEqual(
      expect.arrayContaining([place, anotherPlace])
    );
  });

  it('should be able to get a specific place', async () => {
    await request(app).post('/places').send({
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    });

    const response = await request(app).get('/places/1');

    expect(response.body).toHaveProperty('id');
  });

  it('should be able to update already registered places', async () => {
    await request(app).post('/places').send({
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    });

    const response = await request(app).put('/places/1').send({
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    });

    expect(response.status).toBe(200);
  });

  it('should be able list places filtering by name', async () => {
    const place = {
      id: 1,
      name: 'Teresina Shopping',
      city: 'Teresina',
      state: 'PI',
    };

    const anotherPlace = {
      id: 2,
      name: 'Cocais Shopping',
      city: 'Timon',
      state: 'MA',
    };

    await request(app).post('/places').send(place);
    await request(app).post('/places').send(anotherPlace);

    const response = await request(app).get('/places?name=sina');

    expect(response.body).toHaveLength(1);
  });

  it('should be able to delete a specific place', async () => {
    await request(app).post('/places').send({
      name: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
    });

    const response = await request(app).delete('/places/1');

    expect(response.status).toBe(204);
  });

  it('cannot be able to delete places that have not been registered', async () => {
    const response = await request(app).delete('/places/400');
    expect(response.status).toBe(400);
  });
});

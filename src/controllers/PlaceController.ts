import { Request, Response } from 'express';
import conn from '../database/conn';

class PlaceController {
  async index(req: Request, res: Response) {
    const { page = 1 } = req.query;

    try {
      const places = await conn('places')
        .select(['id', 'name', 'city', 'state'])
        .offset((page - 1) * 5)
        .limit(5);

      return res.json(places);
    } catch (err) {
      return res.status(500).json({ error: 'could not list the places' });
    }
  }

  async create(req: Request, res: Response) {
    const { name, city, state } = req.body;

    try {
      const place = await conn('places')
        .select('id')
        .where('name', name)
        .andWhere('city', city)
        .andWhere('state', state)
        .first();

      if (place) {
        return res
          .status(400)
          .json({ error: 'this place has already been registered' });
      }

      const slug = name.toLowerCase().replace(/ /g, '-');

      const [id] = await conn('places')
        .insert({ name, slug, city, state })
        .returning('id');

      return res.status(201).json({ id });
    } catch (err) {
      return res.status(500).json({ error: 'could not register the place' });
    }
  }
}

export default new PlaceController();

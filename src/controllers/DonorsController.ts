import { Request, Response } from 'express';

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number;
  horario: string;
  to: string;
}

export default class DonorsController {
  async index(request: Request, response: Response) {
    const filters = request.query;

    const blood = filters.blood as string;
    const convenio = filters.convenio as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if (!filters.blood || !filters.time || !filters.week_day) {
      return response.status(400).json({
        error: 'Mising filters to search classes',
      });
    }

    const timeInMinutes = convertHourToMinutes(time);

    const dice = await db('dice')
      .whereExists(function () {
        this.select('dice_plus.*')
          .from('dice_plus')
          .whereRaw('`dice_plus`.`dice_id` = `dice`.`id`')
          .whereRaw('`dice_plus`.`week_day` = ??', [Number(week_day)])
          .whereRaw('`dice_plus`.`horario` <= ??', [timeInMinutes])
          .whereRaw('`dice_plus`.`to` > ??', [timeInMinutes]);
      })
      .where('dice.blood', '=', blood)
      .join('users', 'dice.user_id', '=', 'users.id')
      .select(['dice.*', 'users.*']);

    return response.json(dice);
  }

  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      blood,
      convenio,
      schedule,
    } = request.body;

    const trx = await db.transaction();

    try {
      const insertedUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const user_id = insertedUsersIds[0];

      const insertedDiceIds = await trx('dice').insert({
        blood,
        convenio,
        user_id,
      });

      const dice_id = insertedDiceIds[0];

      const diceSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          dice_id,
          week_day: scheduleItem.week_day,
          horario: convertHourToMinutes(scheduleItem.horario),
          to: convertHourToMinutes(scheduleItem.to),
        };
      });

      await trx('dice_plus').insert(diceSchedule);

      await trx.commit();

      return response.status(201).send();
    } catch (err) {
      await trx.rollback();
      return response.status(400).json({
        error: 'Unexpected error while creating new class',
      });
    }
  }
}

import express from 'express';
import cors from 'cors';
import { param, validationResult } from 'express-validator';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { ISchedulingController } from './controllers/ISchedulingController';

const app = express();

const corsOptions = {
  origin: 'http://lstcovid.joze.cc',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

const controller = myContainer.get<ISchedulingController>(
  TYPES.ISchedulingController
);

app.get(
  '/scheduling/:name',
  param('name').isLength({ min: 10 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return controller
      .getScheduling(req.params.name)
      .then(schedules => res.send(schedules))
      .catch(error => console.log(error));
  }
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

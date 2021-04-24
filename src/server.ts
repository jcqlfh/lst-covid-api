import express from 'express';
import cors from 'cors';
import { param, validationResult } from 'express-validator';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { ISchedulingController } from './controllers/ISchedulingController';
import { ISourceController } from './controllers/ISourceController';

const app = express();

const corsOptions = {
  origin: 'http://lstcovid.joze.cc',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

const schedulingController = myContainer.get<ISchedulingController>(
  TYPES.ISchedulingController
);

const sourceController = myContainer.get<ISourceController>(
  TYPES.ISourceController
);

app.get(
  '/scheduling/:name',
  param('name').isLength({ min: 10 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return schedulingController
      .getScheduling(req.params.name)
      .then(schedules => res.send(schedules))
      .catch(error => res.status(500).json({ errors: error }));
  }
);

app.post('/source', (req, res) => {
  sourceController.updateSource();
  return res.status(200).json({ ok: true });
});

app.get('/source', (req, res) => {
  return res.status(200).json({ ok: sourceController.isUpdating() });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

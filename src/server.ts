import express from 'express';
import cors from 'cors';
import { param, validationResult } from 'express-validator';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { ISchedulingController } from './controllers/ISchedulingController';
import { ISourceController } from './controllers/ISourceController';
import { AddressInfo } from 'net';

const app = express();

const whitelist = [
  'http://lstcovid.joze.cc',
  'https://lstcovid.joze.cc',
  'http://localhost:4200',
];
const corsOptions = {
  optionsSuccessStatus: 200,
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
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

app.get('/source', (req, res) =>
  res.status(200).json({ ok: sourceController.isUpdating() })
);

const PORT = 5000;
const server = app.listen(process.env.PORT || PORT, () => {
  const address = server.address() as AddressInfo;
  console.log(
    `⚡️[server]: Server is running at ${address.address}:${address.port}`
  );
});

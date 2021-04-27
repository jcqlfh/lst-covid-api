import express from 'express';
import cors from 'cors';
import { param, validationResult } from 'express-validator';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { ISchedulingController } from './controllers/ISchedulingController';
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

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));

app.get(
  '/scheduling/:name',
  param('name').trim().isLength({ min: 10 }),
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

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
  const address = server.address() as AddressInfo;
  console.log(
    `⚡️[server]: Server is running at ${address.address}:${address.port}`
  );
});

module.exports = server;

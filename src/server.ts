import express from 'express';
import cors from 'cors';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { ISchedulingController } from './controllers/ISchedulingController';

const app = express();

const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.get('/scheduling/:name', (req, res) =>
  myContainer
    .get<ISchedulingController>(TYPES.ISchedulingController)
    .getScheduling(req.params.name)
    .then(schedules => res.send(schedules))
    .catch(error => console.log(error))
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

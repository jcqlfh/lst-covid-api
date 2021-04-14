import express from 'express';
import cors from 'cors';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { IAgendamentoController } from './controllers/IAgendamentoController';

const app = express();

const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.get('/agendamentos/:name', (req, res) =>
  res.send(
    myContainer
      .get<IAgendamentoController>(TYPES.IAngendamentoController)
      .getAgendamento(req.params.name)
  )
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

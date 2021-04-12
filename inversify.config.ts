// file inversify.config.ts

import { Container } from 'inversify';
import { TYPES } from './types';
import { IAgendamentoController } from './src/controllers/IAgendamentoController';
import { AgendamentoController } from './src/controllers/agendamento.controller';

const myContainer = new Container();
myContainer
  .bind<IAgendamentoController>(TYPES.IAngendamentoController)
  .to(AgendamentoController);

export { myContainer };

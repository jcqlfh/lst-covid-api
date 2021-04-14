// file inversify.config.ts

import { Container } from 'inversify';
import { TYPES } from './types';
import { IAgendamentoController } from './src/controllers/IAgendamentoController';
import { AgendamentoController } from './src/controllers/agendamento.controller';
import { IScrapperService } from './src/services/IScrapperService';
import { ScrapperService } from './src/services/scrapper.service';

const myContainer = new Container();
myContainer
  .bind<IAgendamentoController>(TYPES.IAngendamentoController)
  .to(AgendamentoController);
myContainer.bind<IScrapperService>(TYPES.IScrapperService).to(ScrapperService);

export { myContainer };

import { injectable } from 'inversify';
import 'reflect-metadata';

import { IAgendamento } from '../models/IAgendamento';
import { IAgendamentoController } from './IAgendamentoController';

@injectable()
export class AgendamentoController implements IAgendamentoController {
  public getAgendamento(name: string): IAgendamento {
    console.log(name);
    return {
      name: '',
      neighborhood: '',
      vaccinationSite: '',
      vaccinationDate: '',
      vaccinationHour: '',
    };
  }
}

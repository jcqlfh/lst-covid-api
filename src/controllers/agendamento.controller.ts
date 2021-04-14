import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '../../types';

import { IAgendamento } from '../models/IAgendamento';
import { IScrapperService } from '../services/IScrapperService';
import { IAgendamentoController } from './IAgendamentoController';

@injectable()
export class AgendamentoController implements IAgendamentoController {
  constructor(
    @inject(TYPES.IScrapperService)
    private readonly scrapperService: IScrapperService
  ) {}

  public getAgendamento(name: string): IAgendamento {
    console.log(name);
    this.scrapperService.refreshFiles();
    return {
      name: '',
      neighborhood: '',
      vaccinationSite: '',
      vaccinationDate: '',
      vaccinationHour: '',
      dose: '',
      birthday: '',
    };
  }
}

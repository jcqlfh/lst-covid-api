import { IAgendamento } from '../models/IAgendamento';

export interface IAgendamentoController {
  getAgendamento: (name: string) => IAgendamento;
}

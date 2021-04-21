import { IScheduling } from '../models/IScheduling';

export interface ISchedulingController {
  getScheduling: (name: string) => Promise<IScheduling[]>;
}

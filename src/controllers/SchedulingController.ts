import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '../../types';

import { IScheduling } from '../models/IScheduling';
import { IScrapperService } from '../services/IScrapperService';
import { ISourceService } from '../services/ISourceService';
import { ISchedulingController } from './ISchedulingController';

@injectable()
export class SchedulingController implements ISchedulingController {
  constructor(
    @inject(TYPES.IScrapperService)
    private readonly scrapperService: IScrapperService,
    @inject(TYPES.ISourceService)
    private readonly sourceService: ISourceService
  ) {}

  public getScheduling(name: string): Promise<IScheduling[]> {
    console.log(name);
    return this.scrapperService
      .refreshFiles(this.sourceService.canUpdate())
      .then(source => {
        this.sourceService.setSource(source);
        return this.sourceService.search(name).map(i => ({
          name,
          url: i.url,
          text: i.value,
        }));
      })
      .catch(error => {
        console.error(error);
        return [];
      });
  }
}

import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '../../types';
import { ISourceController } from './ISourceController';
import { ISourceService } from '../services/ISourceService';
import { IScrapperService } from '../services/IScrapperService';

@injectable()
export class SourceController implements ISourceController {
  constructor(
    @inject(TYPES.ISourceService)
    private readonly sourceService: ISourceService,
    @inject(TYPES.IScrapperService)
    private readonly scrapperService: IScrapperService
  ) {}

  updateSource() {
    this.sourceService.setUpdating(true);
    this.scrapperService
      .refreshFiles()
      .then(source => {
        this.sourceService.setSource(source);
        this.sourceService.setUpdating(false);
      })
      .catch(error => {
        console.error(error);
        this.sourceService.setUpdating(false);
      });
  }

  isUpdating() {
    return this.sourceService.isUpdating();
  }
}

// file inversify.config.ts

import { Container } from 'inversify';
import { TYPES } from './types';
import { ISchedulingController } from './src/controllers/ISchedulingController';
import { SchedulingController } from './src/controllers/SchedulingController';
import { IScrapperService } from './src/services/IScrapperService';
import { ScrapperService } from './src/services/ScrapperService';
import { ISourceService } from './src/services/ISourceService';
import { SourceService } from './src/services/SourceService';

const myContainer = new Container();
myContainer
  .bind<ISchedulingController>(TYPES.ISchedulingController)
  .to(SchedulingController);
myContainer.bind<IScrapperService>(TYPES.IScrapperService).to(ScrapperService);
myContainer
  .bind<ISourceService>(TYPES.ISourceService)
  .toConstantValue(new SourceService());

export { myContainer };

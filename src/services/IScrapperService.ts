import { IFileSource } from '../models/IFileSource';

export interface IScrapperService {
  refreshFiles: (canUpdate: boolean) => Promise<IFileSource>;
}

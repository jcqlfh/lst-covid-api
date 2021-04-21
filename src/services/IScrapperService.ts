import { IFileSource } from '../models/IFileSource';

export interface IScrapperService {
  refreshFiles: () => Promise<IFileSource>;
}

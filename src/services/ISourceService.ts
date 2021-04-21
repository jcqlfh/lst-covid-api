import { IFileSource } from '../models/IFileSource';
import { IMatch } from '../models/IMatch';

export interface ISourceService {
  getSource: () => IFileSource;
  setSource: (source: IFileSource) => IFileSource;
  search: (value: string) => IMatch[];
}

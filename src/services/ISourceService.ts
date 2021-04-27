import { IFileSource } from '../models/IFileSource';
import { IMatch } from '../models/IMatch';

export interface ISourceService {
  canUpdate: () => boolean;
  getSource: () => IFileSource;
  setSource: (source: IFileSource) => IFileSource;
  search: (value: string) => IMatch[];
  isUpdating: () => boolean;
  setUpdating: (isUpdating: boolean) => void;
}

import { IPage } from './IPage';

export interface IFile {
  url: string;
  hash: string;
  pages: IPage[];
}

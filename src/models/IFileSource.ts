import { IFile } from './IFile';

export interface IFileSource {
  hash: string;
  files: IFile[];
}

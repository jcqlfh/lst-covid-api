import { IFileSource } from '../models/IFileSource';
import { ISourceService } from './ISourceService';
import { IDocument } from '../models/IDocument';
import { IFile } from '../models/IFile';
import { IMatch } from '../models/IMatch';
import elasticlunr from 'elasticlunr';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class SourceService implements ISourceService {
  private fileSource!: IFileSource;
  private readonly index: elasticlunr.Index<IDocument>;

  constructor() {
    this.index = elasticlunr<IDocument>();
  }

  getSource() {
    return this.fileSource;
  }

  setSource(source: IFileSource) {
    if (this.fileSource?.hash !== source.hash) {
      for (const file of source.files) {
        const sourceFile = this.fileSource.files.find(f => f.url === file.url);
        if (!sourceFile) {
          this.addPages(file);
        } else if (sourceFile.hash !== file.hash) {
          this.removePages(sourceFile);
          this.addPages(file);
        }
      }
      this.fileSource = source;
    }
    return this.fileSource;
  }

  private removePages(file: IFile) {
    for (const page of file.pages) {
      this.index.removeDoc({
        url: file.url,
        page: page.pageNum,
        content: page.content.join(';'),
      });
    }
  }

  private addPages(file: IFile) {
    for (const page of file.pages) {
      this.index.addDoc({
        url: file.url,
        page: page.pageNum,
        content: page.content.join(';'),
      });
    }
  }

  search(value: string) {
    return this.index.search(value).map(i => {
      const document = this.index.documentStore.getDoc(i.ref);
      return {
        url: document.url,
        page: document.page,
        value,
      } as IMatch;
    });
  }
}

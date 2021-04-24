import { IFileSource } from '../models/IFileSource';
import { ISourceService } from './ISourceService';
import { IDocument } from '../models/IDocument';
import { IFile } from '../models/IFile';
import { IMatch } from '../models/IMatch';
import elasticlunr from 'elasticlunr';
import hash from 'object-hash';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class SourceService implements ISourceService {
  private fileSource!: IFileSource;
  private readonly index: elasticlunr.Index<IDocument>;
  private updating = false;

  constructor() {
    this.index = elasticlunr(function () {
      this.addField('line');
      this.setRef('hash');
    });
  }

  getSource() {
    return this.fileSource;
  }

  setSource(source: IFileSource) {
    if (this.fileSource?.hash !== source.hash) {
      for (const file of source.files) {
        const sourceFile = this.fileSource?.files.find(f => f.url === file.url);
        if (!sourceFile) {
          this.addDocuments(file);
        } else if (sourceFile.hash !== file.hash) {
          this.removeDocuments(sourceFile);
          this.addDocuments(file);
        }
      }
      this.fileSource = source;
    }
    return this.fileSource;
  }

  private removeDocuments(file: IFile) {
    file.text.forEach(line =>
      this.index.removeDoc({
        line,
        hash: hash(line),
        url: file.url,
      } as IDocument)
    );
  }

  private addDocuments(file: IFile) {
    if (!!file && !!file.text) {
      file.text.forEach(line =>
        this.index.addDoc({ line, url: file.url, hash: hash(line) })
      );
    }
  }

  search(value: string) {
    try {
      return this.index
        .search(value, {
          fields: {
            line: { bool: 'AND' },
          },
        })
        .map(i => {
          const document = this.index.documentStore.getDoc(i.ref);
          return {
            url: document.url,
            value: document.line,
          } as IMatch;
        });
    } catch (e) {
      console.error('error on search', e);
    }
    return [];
  }

  isUpdating(): boolean {
    return this.updating;
  }

  setUpdating(isUpdating: boolean) {
    this.updating = isUpdating;
  }
}

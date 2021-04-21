import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';
import hash from 'object-hash';
import {
  getDocument,
  GlobalWorkerOptions,
  VerbosityLevel,
  PDFWorker,
} from 'pdfjs-dist/legacy/build/pdf';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/display/api';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '../../types';

import { IFileSource } from '../models/IFileSource';
import { IScrapperService } from './IScrapperService';
import { ISourceService } from './ISourceService';
import { IFile } from '../models/IFile';
import { IPage } from '../models/IPage';

@injectable()
export class ScrapperService implements IScrapperService {
  constructor(
    @inject(TYPES.ISourceService)
    private readonly sourceService: ISourceService
  ) {}
  public refreshFiles(): Promise<IFileSource> {
    console.log('refreshFiles');
    return axios
      .get(
        'https://spreadsheets.google.com/feeds/list/1IJBDu8dRGLkBgX72sRWKY6R9GfefsaDCXBd3Dz9PZNs/14/public/values'
      )
      .then(res =>
        this.processResult(res)
          .then(result => this.sourceService.setSource(result))
          .catch(error =>
            Promise.resolve({ files: [], hash: '' } as IFileSource)
          )
      )
      .catch(error => Promise.resolve({ files: [], hash: '' } as IFileSource));
  }

  private processResult(res: AxiosResponse): Promise<IFileSource> {
    console.log('processResult');
    return new Promise(resolve => {
      const fileSource = this.sourceService.getSource();
      const parser = xml2js.parseString;
      parser(res.data, (err, result) => {
        const hashValue = hash(result);
        if (result && fileSource?.hash !== hashValue) {
          resolve(
            this.getFiles(result.feed.entry, fileSource?.files)
              .then(files => ({ files, hash: hash(result) } as IFileSource))
              .catch(error =>
                Promise.resolve({ files: [], hash: '' } as IFileSource)
              )
          );
        }
      });
      return resolve(fileSource);
    });
  }

  private async getFiles(pdfs: [], files: IFile[]): Promise<IFile[]> {
    console.log('getFiles');
    const fileList: IFile[] = [];
    let p = Promise.resolve(fileList);
    for (const pdf of pdfs) {
      const url = pdf['gsx:pdf'][0];
      console.log(url);
      p = p
        .then(() => {
          try {
            GlobalWorkerOptions.workerSrc = PDFWorker.getWorkerSrc();
            return getDocument({
              url,
              stopAtErrors: false,
              verbosity: VerbosityLevel.ERRORS,
            })
              .promise.then(data => {
                try {
                  console.log(url);
                  const sourceFile = files?.find(f => f.url === url);
                  if (sourceFile?.hash !== data.fingerprint) {
                    return this.getPages(data)
                      .then(
                        pages =>
                          ({ pages, url, hash: data.fingerprint } as IFile)
                      )
                      .catch(error =>
                        Promise.resolve({
                          pages: [],
                          url: '',
                          hash: '',
                        } as IFile)
                      );
                  } else {
                    return Promise.resolve({
                      url,
                      hash: data.fingerprint,
                      pages: [],
                    } as IFile);
                  }
                } catch (e) {
                  console.log(e);
                }
                return Promise.resolve({
                  pages: [],
                  url: '',
                  hash: '',
                } as IFile);
              })
              .catch(error => {
                console.log(error);
                return Promise.resolve({
                  url,
                  hash: '',
                  pages: [],
                } as IFile);
              })
              .then(file => fileList.concat(fileList, file))
              .catch(error => {
                console.log(error);
                return Promise.resolve([]);
              });
          } catch (error) {
            console.log(error);
          }
          return Promise.resolve([]);
        })
        .catch(error => {
          console.log(error);
          return Promise.resolve([]);
        });
    }
    return p;
  }

  private getPages(data: PDFDocumentProxy): Promise<IPage[]> {
    const pageList: IPage[] = [];
    let p = Promise.resolve(pageList);
    for (let i = 1; i <= data.numPages; i++) {
      p = p
        .then(() => {
          console.log('page ' + i);
          return data
            .getPage(i)
            .then(item =>
              this.getContent(item)
                .then(
                  content =>
                    ({
                      content,
                      pageNum: item.pageNumber,
                    } as IPage)
                )
                .catch(error =>
                  Promise.resolve({
                    content: [],
                    pageNum: 0,
                  } as IPage)
                )
            )
            .catch(error =>
              Promise.resolve({
                content: [],
                pageNum: 0,
              } as IPage)
            )
            .then(page => pageList.concat(pageList, page))
            .catch(error => {
              console.log(error);
              return Promise.resolve([]);
            });
        })
        .catch(error => {
          console.log(error);
          return Promise.resolve([]);
        });
    }
    return p;
  }

  private getContent(item: PDFPageProxy): Promise<string[]> {
    return item
      .getTextContent()
      .then(text => text.items.map(t => t.str))
      .catch(error => {
        console.log(error);
        return Promise.resolve([]);
      });
  }
}

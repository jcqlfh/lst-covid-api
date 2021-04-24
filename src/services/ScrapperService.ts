import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';
import hash from 'object-hash';
import crawler from 'crawler-request';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { IFileSource } from '../models/IFileSource';
import { IScrapperService } from './IScrapperService';
import { IFile } from '../models/IFile';

@injectable()
export class ScrapperService implements IScrapperService {
  public refreshFiles(): Promise<IFileSource> {
    return axios
      .get(
        'https://spreadsheets.google.com/feeds/list/1IJBDu8dRGLkBgX72sRWKY6R9GfefsaDCXBd3Dz9PZNs/14/public/values'
      )
      .then(res =>
        this.processResult(res)
          .then()
          .catch(error => {
            console.error(error);
            return Promise.resolve({ files: [], hash: '' } as IFileSource);
          })
      )
      .catch(error => {
        console.error(error);
        return Promise.resolve({ files: [], hash: '' } as IFileSource);
      });
  }

  private processResult(res: AxiosResponse): Promise<IFileSource> {
    return new Promise(resolve => {
      const parser = xml2js.parseString;
      const fileList: IFile[] = [];
      parser(res.data, (err, result) => {
        const hashValue = hash(
          result.feed.entry.map(entry => entry['gsx:pdf'][0])
        );
        resolve(
          Promise.allSettled<IFile>(
            result.feed.entry.map(pdf =>
              this.getFile(pdf)
                .then()
                .catch(error => {
                  console.error(error);
                  return Promise.resolve({});
                })
            )
          )
            .then(
              files =>
                ({
                  files: files
                    .filter(file => file.status === 'fulfilled')
                    .map((file: PromiseFulfilledResult<IFile>) => file.value),
                  hash: hash(
                    result.feed.entry.map(entry => entry['gsx:pdf'][0])
                  ),
                } as IFileSource)
            )
            .catch(error => {
              console.error(error);
              return Promise.resolve({
                files: [],
                hash: '',
              } as IFileSource);
            })
        );
      });
      return resolve({
        files: [],
        hash: '',
      } as IFileSource);
    });
  }

  private async getFile(pdf): Promise<IFile> {
    const url = pdf['gsx:pdf'][0] as string;
    if (url.endsWith('.pdf')) {
      return crawler(url)
        .then(response =>
          response.text
            .split('\n')
            .filter(line =>
              line.match(
                '\\s*([A-Z ]+)\\s*([0-9-]{10})\\s*([A-Z ]+)\\s*([0-9-]{10})\\s*([0-9:]{8})\\s*([0-9]{1})\\s*'
              )
            )
            .map(line =>
              line
                .match(
                  '\\s*([A-Z ]+)\\s*([0-9-]{10})\\s*([A-Z ]+)\\s*([0-9-]{10})\\s*([0-9:]{8})\\s*([0-9]{1})\\s*'
                )
                .slice(1, 7)
                .join(';')
            )
        )
        .then(content => ({ hash: hash(content), text: content, url } as IFile))
        .catch(err => {
          console.error(url, err);
          return Promise.resolve({} as IFile);
        });
    } else {
      return Promise.resolve({} as IFile);
    }
  }
}

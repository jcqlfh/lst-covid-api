import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';
import hash from 'object-hash';
import crawler from 'crawler-request';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { IFileSource } from '../models/IFileSource';
import { IScrapperService } from './IScrapperService';
import { IFile } from '../models/IFile';
import * as DateUtil from '../util/date.util';

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
    const today = new Date();
    const dateRange = DateUtil.getDaysArray(today, 5);
    return new Promise(resolve => {
      const parser = xml2js.parseString;
      parser(res.data, (err, result) =>
        resolve(
          Promise.allSettled<IFile>(
            result.feed.entry
              .filter(
                pdf =>
                  pdf['gsx:titulo'][0].match('[0-9/]{10}') &&
                  dateRange.includes(
                    pdf['gsx:titulo'][0].match('[0-9/]{10}')[0]
                  )
              )
              .map(pdf =>
                this.getFile(pdf['gsx:pdf'][0] as string)
                  .then()
                  .catch(error => {
                    console.error(error);
                    return Promise.resolve({});
                  })
              )
          )
            .then(files => {
              console.log(files);
              return {
                files: files
                  .filter(file => file.status === 'fulfilled')
                  .map((file: PromiseFulfilledResult<IFile>) => file.value),
                hash: hash(result.feed.entry.map(entry => entry['gsx:pdf'][0])),
              } as IFileSource;
            })
            .catch(error => {
              console.error(error);
              return Promise.resolve({
                files: [],
                hash: '',
              } as IFileSource);
            })
        )
      );
      return resolve({
        files: [],
        hash: '',
      } as IFileSource);
    });
  }

  private async getFile(url: string): Promise<IFile> {
    console.log(url);
    if (url.endsWith('.pdf')) {
      return crawler(url)
        .then(response =>
          response.text
            .split('\n')
            .filter(line => {
              return line.match(
                '\\s*([a-zA-Z\u00C0-\u017F ]+)\\s*([0-9-]{10})\\s*([a-zA-Z\u00C0-\u017F. ]+)\\s*([0-9-/]{10})\\s*([0-9:h]{8})\\s*([0-9]{1})\\s*'
              );
            })
            .map(line => {
              return line
                .match(
                  '\\s*([a-zA-Z\u00C0-\u017F ]+)\\s*([0-9-]{10})\\s*([a-zA-Z\u00C0-\u017F. ]+)\\s*([0-9-/]{10})\\s*([0-9:h]{8})\\s*([0-9]{1})\\s*'
                )
                .slice(1, 7)
                .join(';');
            })
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

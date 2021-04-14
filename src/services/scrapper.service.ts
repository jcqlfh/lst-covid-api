import axios from 'axios';
import xml2js from 'xml2js';
import hash from 'object-hash';
import { getDocument } from 'pdfjs-dist/es5/build/pdf';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { IScrapperService } from './IScrapperService';

@injectable()
export class ScrapperService implements IScrapperService {
  public refreshFiles() {
    axios
      .get(
        'https://spreadsheets.google.com/feeds/list/1IJBDu8dRGLkBgX72sRWKY6R9GfefsaDCXBd3Dz9PZNs/14/public/values'
      )
      .then(res => {
        const parser = xml2js.parseString;
        parser(res.data, (err, result) => {
          console.log(hash(result));
          for (const pdf of result.feed.entry) {
            console.log(pdf['gsx:pdf'][0]);
            const pdfDoc = getDocument(pdf['gsx:pdf'][0]);
            pdfDoc.promise
              .then(data => {
                console.log(data);
                for (let i = 1; i <= data.numPages; i++) {
                  const page = data.getPage(i);
                  console.log(page);
                  page
                    .then(item => {
                      item
                        .getTextContent()
                        .then(text => {
                          console.log(text);
                        })
                        .catch(error => {
                          console.log(error);
                        });
                    })
                    .catch(error => {
                      console.log(error);
                    });
                }
              })
              .catch(error => {
                console.log(error);
              });
            break;
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
}

import {JASLib} from 'jas_api';

import {JasSpreadsheet} from './jas_spreadsheet';



type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export default class JasSpreadsheetTest implements JASLib.Test {
  /** This is the Lease Spreadsheet Template. */
  private readonly spreadsheetId =
      '1e-xDkyts6jt_2JPGS5i1hX4opVJ9niQ9f0y8YtAvTlw';

  run(t: JASLib.Tester) {
    const findSheet = (sheetName: string) => {
      return JasSpreadsheet.findSheet(sheetName, this.spreadsheetId);
    };

    t.describe('findSheet', () => {
      t.it('finds present sheet', () => {
        t.expect(() => findSheet('balance')).not.toThrow();
      });

      t.it('does fuzzy matching, ignoring case', () => {
        t.expect(() => findSheet('BAL')).not.toThrow();
        t.expect(() => findSheet('CONFI')).not.toThrow();
      });

      t.it('throws for absent sheet', () => {
        t.expect(() => findSheet('no such sheet')).toThrow('Expected a sheet');
      });

      t.describe('with multiple matching sheets', () => {
        const spreadsheet = JasSpreadsheet.getSpreadsheet(this.spreadsheetId);
        let newSheet: Sheet;

        t.beforeEach(() => {
          newSheet = spreadsheet.insertSheet();
          newSheet.setName('Balad');  // To share prefix with 'Balance' sheet.
        });

        t.afterEach(() => {
          spreadsheet.deleteSheet(newSheet);
        });

        t.it('throws for ambiguous query', () => {
          t.expect(() => findSheet('bala')).toThrow('multiple sheets');
        });
      });
    });

    t.describe('createSheetCache', () => {
      t.it('works', () => {
        const sheetCache =
            JasSpreadsheet.createSheetCache(findSheet('balance'));
        t.expect(sheetCache.data.length > 0).toBe(true);
        t.expect(sheetCache.data[0].length > 0).toBe(true);
        t.expect(sheetCache.headerRow).toBe(1);
      });

      t.it('caches windows', () => {
        const sheetCache =
            JasSpreadsheet.createSheetCache(findSheet('balance'), 2, 2, 4, 6);
        t.expect(sheetCache.data.length).toBe(4);
        t.expect(sheetCache.data[0].length).toBe(6);
      });
    });

    t.describe('findColumn', () => {
      const sheet = findSheet('balance');

      t.it('finds present column', () => {
        t.expect(() => JasSpreadsheet.findColumn('description', sheet))
            .not.toThrow();
      });

      t.it('does fuzzy matching, ignoring case', () => {
        t.expect(() => JasSpreadsheet.findColumn('DESCR', sheet)).not.toThrow();
        t.expect(() => JasSpreadsheet.findColumn('TRANSACT', sheet))
            .not.toThrow();
      });

      t.it('throws for absent column', () => {
        t.expect(() => JasSpreadsheet.findColumn('no such column', sheet))
            .toThrow('Expected a column');
      });

      t.it('throws for ambiguous column', () => {
        t.expect(() => JasSpreadsheet.findColumn('d', sheet))
            .toThrow('multiple columns');
      });
    });

    t.describe('findColumnInCache', () => {
      const cache = JasSpreadsheet.createSheetCache(findSheet('balance'));

      t.it('finds present column', () => {
        t.expect(() => JasSpreadsheet.findColumnInCache('description', cache))
            .not.toThrow();
      });

      t.it('does fuzzy matching, ignoring case', () => {
        t.expect(() => JasSpreadsheet.findColumnInCache('DESCR', cache))
            .not.toThrow();
        t.expect(() => JasSpreadsheet.findColumnInCache('TRANSACT', cache))
            .not.toThrow();
      });

      t.it('throws for absent column', () => {
        t.expect(
             () => JasSpreadsheet.findColumnInCache('no such column', cache))
            .toThrow('Expected a column');
      });

      t.it('throws for ambiguous column', () => {
        t.expect(() => JasSpreadsheet.findColumnInCache('d', cache))
            .toThrow('multiple columns');
      });
    });

    t.describe('findRow', () => {
      const sheet = findSheet('config');

      t.it('finds present row', () => {
        t.expect(() => JasSpreadsheet.findRow('interest rate', sheet))
            .not.toThrow();
      });

      t.it('does fuzzy matching, ignoring case', () => {
        t.expect(() => JasSpreadsheet.findRow('PAYMENT T', sheet))
            .not.toThrow();
        t.expect(() => JasSpreadsheet.findRow('EMAIL DIS', sheet))
            .not.toThrow();
      });

      t.it('throws for absent row', () => {
        t.expect(() => JasSpreadsheet.findRow('no such row', sheet))
            .toThrow('Expected a row');
      });

      t.it('throws for ambiguous row', () => {
        t.expect(() => JasSpreadsheet.findRow('customer', sheet))
            .toThrow('multiple rows');
      });
    });

    t.describe('findRowInCache', () => {
      const cache = JasSpreadsheet.createSheetCache(findSheet('config'));

      t.it('finds present row', () => {
        t.expect(() => JasSpreadsheet.findRowInCache('interest rate', cache))
            .not.toThrow();
      });

      t.it('does fuzzy matching, ignoring case', () => {
        t.expect(() => JasSpreadsheet.findRowInCache('PAYMENT T', cache))
            .not.toThrow();
        t.expect(() => JasSpreadsheet.findRowInCache('EMAIL DIS', cache))
            .not.toThrow();
      });

      t.it('throws for absent row', () => {
        t.expect(() => JasSpreadsheet.findRowInCache('no such row', cache))
            .toThrow('Expected a row');
      });

      t.it('throws for ambiguous row', () => {
        t.expect(() => JasSpreadsheet.findRowInCache('customer', cache))
            .toThrow('multiple rows');
      });
    });
  }
}

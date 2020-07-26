import { JasSpreadsheet } from './jas_spreadsheet';
import { JASLib } from "jas_api"

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export default class JasSpreadsheetTest implements JASLib.Test {
  readonly name = 'JasSpreadsheetTest';

  /** This is the Lease Spreadsheet Template. */
  private readonly spreadsheetId =
      '1e-xDkyts6jt_2JPGS5i1hX4opVJ9niQ9f0y8YtAvTlw';

  run(t: JASLib.Tester) {
    const findSheet = (sheetName: string) => {
      return JasSpreadsheet.findSheet(sheetName, this.spreadsheetId);
    }

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
          newSheet.setName('Balad'); // To share prefix with 'Balance' sheet.
        });

        t.afterEach(() => {
          spreadsheet.deleteSheet(newSheet);
        });

        t.it('throws for ambiguous query', () => {
          t.expect(() => findSheet('bala')).toThrow('multiple sheets');
        });
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
  }
}

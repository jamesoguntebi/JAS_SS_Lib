import JasRange, { CellData } from './jas_range';
import JasSpreadsheet from './jas_spreadsheet';
import { JASLib } from "jas_api"

type Range = GoogleAppsScript.Spreadsheet.Range;

export default class JasRangeTest implements JASLib.Test {
  readonly name = 'JasRangeTest';

  /** This is the Lease Spreadsheet Template. */
  private readonly spreadsheetId =
      '1e-xDkyts6jt_2JPGS5i1hX4opVJ9niQ9f0y8YtAvTlw';

  run(t: JASLib.Tester) {
    const sheet = JasSpreadsheet.findSheet('balance', this.spreadsheetId);

    t.describe('getFixedA1Notation', () => {
      t.it('adds dollar sign symbol', () => {
        t.expect(JasRange.getFixedA1Notation(sheet.getRange(1, 1)))
            .toEqual(`'Balance'!$A$1`);
      });

      t.it('throws for multi-cell range', () => {
        const range = sheet.getRange(1, 1, 2, 2);
        t.expect(() => JasRange.getFixedA1Notation(range))
            .toThrow('multi-cell');
      });
    });

    t.describe('CellData', () => {
      let defaultRange: Range;
      let defaultOldValue: any;

      t.beforeEach(() => {
        defaultRange = sheet.getRange(2, 2, 1, 1);
        defaultOldValue = defaultRange.getValue();
      });

      t.afterEach(() => defaultRange.setValue(defaultOldValue));

      t.it('throws for multi-cell range', () => {
        const range = sheet.getRange(1, 1, 2, 2);
        t.expect(() => new CellData(range)).toThrow('multi-cell');
      });

      t.it('throws for wrong type', () => {
        defaultRange.setValue(3);
        t.expect(() => new CellData(defaultRange).string())
            .toThrow('expected string');
      });

      t.it('handles optional calls', () => {
        defaultRange.clear({contentsOnly: true});
        t.expect(new CellData(defaultRange).stringOptional())
            .toEqual(undefined);
      });

      t.it('finds string array', () => {
        defaultRange.setValue(
            ',,apples,bananas\ncarrots  ,,\n\ndragonfruit, edameme');
        t.expect(new CellData(defaultRange).stringArray()).toEqual(
            ['apples', 'bananas', 'carrots', 'dragonfruit', 'edameme']);
      });
    });
  }
}
import {CellData} from './jas_range';

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;
type Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;

export class JasSpreadsheet {
  static getSpreadsheet(spreadsheetId: string): Spreadsheet {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  static findSheet(name: string, spreadsheetId: string): Sheet {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    if (!spreadsheet) {
      throw new Error(`Cannot find spreadsheet with id: ${spreadsheetId}`);
    }

    name = name.toLowerCase();
    const matches: Sheet[] = [];
    for (const sheet of spreadsheet.getSheets()) {
      if (sheet.getName().toLowerCase().includes(name)) {
        matches.push(sheet);
      }
    }
    if (matches.length > 1) {
      throw new Error(`Multiple sheets '${
          matches.map(s => s.getName()).join(', ')}' matched query '${name}'`);
    }
    if (matches.length === 0) {
      throw new Error(`Expected a sheet with a name including '${name}'.`);
    }
    return matches[0];
  }

  static createSheetCache(
      sheet: Sheet, row = 1, column = 1, numRows = -1,
      numColumns = -1): SheetCache {
    const data =
        sheet.getSheetValues(row, column, numRows, numColumns)
            .map(
                (valueRow, rowDelta) => valueRow.map(
                    (value, colDelta) => new CellData(
                        value, `(${row + rowDelta}, ${column + colDelta})`)));
    return {
      data,
      headerColumn: (sheet.getFrozenColumns() || 1) - 1,
      headerRow: (sheet.getFrozenRows() || 1) - 1,
      name: sheet.getName(),
    };
  }

  /**
   * Returns the index of the first matching row. Throws if not found or if
   * multiple are found.
   * @deprecated Prefer findRowInCache. Much faster.
   */
  static findRow(name: string, sheet: Sheet): number {
    name = name.toLowerCase();
    const headerCol = sheet.getFrozenColumns() || 1;
    const lastRow = sheet.getLastRow();
    const rowLabels: string[] = [];
    const matches: Array<{row: number, rowLabel: string}> = [];

    for (let row = 1; row <= lastRow; row++) {
      const rowLabel = String(sheet.getRange(row, headerCol).getValue());
      if (rowLabel.toLowerCase().includes(name)) {
        matches.push({row, rowLabel});
      } else if (rowLabel) {
        rowLabels.push(rowLabel);
      }
    }

    if (matches.length > 1) {
      throw new Error(`Multiple rows '${
          matches.map(m => m.rowLabel).join(', ')}' matched query '${name}'`);
    }
    if (matches.length === 0) {
      throw new Error(
          `Expected a row with a name including '${name}' in ` +
          `sheet '${sheet.getName()}'. ` +
          `Row labels: ${rowLabels.join(', ')}`);
    }
    return matches[0].row;
  }

  /**
   * The same as findRow, but uses a SheetCache. Note that cache row and
   * column indices are 0-based.
   */
  static findRowInCache(name: string, cache: SheetCache): number {
    name = name.toLowerCase();
    const rowLabels: string[] = [];
    const matches: Array<{row: number, rowLabel: string}> = [];

    for (const [row, cells] of cache.data.entries()) {
      const rowLabel = String(cells[cache.headerColumn].untypedData());
      if (rowLabel.toLowerCase().includes(name)) {
        matches.push({row, rowLabel});
      } else if (rowLabel) {
        rowLabels.push(rowLabel);
      }
    }

    if (matches.length > 1) {
      throw new Error(`Multiple rows '${
          matches.map(m => m.rowLabel).join(', ')}' matched query '${name}'`);
    }
    if (matches.length === 0) {
      throw new Error(
          `Expected a row with a name including '${name}' in ` +
          `sheet '${cache.name}'. ` +
          `Row labels: ${rowLabels.join(', ')}`);
    }
    return matches[0].row;
  }

  /**
   * Returns the index of the first matching column. Throws if not found or if
   * multiple are found.
   * @deprecated Prefer findColumnInCache. Much faster.
   */
  static findColumn(name: string, sheet: Sheet): number {
    name = name.toLowerCase();
    const headerRow = sheet.getFrozenRows() || 1;
    const lastColumn = sheet.getLastColumn();
    const columnLabels: string[] = [];
    const matches: Array<{col: number, columnLabel: string}> = [];

    for (let col = 1; col <= lastColumn; col++) {
      const columnLabel = String(sheet.getRange(headerRow, col).getValue());
      if (columnLabel.toLowerCase().includes(name)) {
        matches.push({col, columnLabel});
      } else {
        columnLabels.push(columnLabel);
      }
    }

    if (matches.length > 1) {
      throw new Error(`Multiple columns '${
          matches.map(m => m.columnLabel).join(', ')}' matched query '${
          name}'`);
    }
    if (matches.length === 0) {
      throw new Error(
          `Expected a column with a name including '${name}' in ` +
          `sheet '${sheet.getName()}'. ` +
          `Column labels: ${columnLabels.join(', ')}`);
    }

    return matches[0].col;
  }

  /**
   * The same as findColumn, but uses a SheetCache. Note that cache row and
   * column indices are 0-based.
   */
  static findColumnInCache(name: string, cache: SheetCache): number {
    name = name.toLowerCase();
    const columnLabels: string[] = [];
    const matches: Array<{col: number, columnLabel: string}> = [];

    for (const [col, cell] of cache.data[cache.headerRow].entries()) {
      const columnLabel = String(cell.untypedData());
      if (columnLabel.toLowerCase().includes(name)) {
        matches.push({col, columnLabel});
      } else {
        columnLabels.push(columnLabel);
      }
    }

    if (matches.length > 1) {
      throw new Error(`Multiple columns '${
          matches.map(m => m.columnLabel).join(', ')}' matched query '${
          name}'`);
    }
    if (matches.length === 0) {
      throw new Error(
          `Expected a column with a name including '${name}' in ` +
          `sheet '${cache.name}'. ` +
          `Column labels: ${columnLabels.join(', ')}`);
    }

    return matches[0].col;
  }
}


export interface SheetCache {
  /** 2d array of CellDatas. */
  data: CellData[][];
  /** Last frozen column. */
  headerColumn: number;
  /** Last frozen row. */
  headerRow: number;
  /** Sheet name. */
  name: string;
}

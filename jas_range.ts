type Range = GoogleAppsScript.Spreadsheet.Range;

export class JasRange {
  /**
   * Returns A1 notation for a range, including the sheet name, with fixed row
   * and fixed column.
   */
  static getFixedA1Notation(range: Range): string {
    new CellData(range);  // To assert it is a single cell.
    const nonFixedA1 = range.getA1Notation();

    const sheet = range.getSheet().getName();
    const row = nonFixedA1.match(/[a-zA-Z]+/);
    const column = nonFixedA1.match(/[0-9]+/);

    return `'${sheet}'!$${row}$${column}`;
  }
}

export class CellData {
  private readonly data: unknown;

  constructor(private range: Range) {
    if (range.getHeight() !== 1 || range.getWidth() !== 1) {
      throw new Error('CellData is invalid for multi-cell ranges.');
    }

    this.data = range.getValue();
  }

  isBlank(): boolean {
    return this.range.isBlank();
  }

  string(defaultValue?: string): string {
    if (this.isBlank() && defaultValue !== undefined) {
      return defaultValue;
    }
    if (this.isBlank() || typeof this.data !== 'string') {
      throw new Error(`Expected string in cell ${this.getCellString()}`);
    }
    return this.data as string;
  }

  stringOptional(): string|undefined {
    return this.isBlank() ? undefined : this.string();
  }

  stringArray(): string[] {
    return this.isBlank() ?
        [] :
        this.string().split(/,|\n/).map(s => s.trim()).filter(s => !!s);
  }

  number(defaultValue?: number): number {
    if (this.isBlank() && defaultValue !== undefined) {
      return defaultValue;
    }
    if (this.isBlank() || typeof this.data !== 'number') {
      throw new Error(`Expected number in cell ${this.getCellString()}`);
    }
    return this.data as number;
  }

  numberOptional(): number|undefined {
    return this.isBlank() ? undefined : this.number();
  }


  date(includeTime = false): Date {
    if (this.isBlank() || !CellData.isDateValue(this.data)) {
      throw new Error(`Expected date in cell ${this.getCellString()}`);
    }
    const date = this.data as Date;
    if (!includeTime) date.setHours(0, 0, 0, 0);
    return date;
  }

  private getCellString(): string {
    return `${this.range.getSheet().getName()}!${this.range.getA1Notation()}`;
  }

  private static isDateValue(value: any): boolean {
    return Object.prototype.toString.call(value) === '[object Date]' &&
        !isNaN(value.getTime());
  }
}

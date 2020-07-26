var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
System.register("jas_range", [], function (exports_1, context_1) {
    "use strict";
    var JasRange, CellData;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            JasRange = /** @class */ (function () {
                function JasRange() {
                }
                /**
                 * Returns A1 notation for a range, including the sheet name, with fixed row
                 * and fixed column.
                 */
                JasRange.getFixedA1Notation = function (range) {
                    new CellData(range); // To assert it is a single cell.
                    var nonFixedA1 = range.getA1Notation();
                    var sheet = range.getSheet().getName();
                    var row = nonFixedA1.match(/[a-zA-Z]+/);
                    var column = nonFixedA1.match(/[0-9]+/);
                    return "'" + sheet + "'!$" + row + "$" + column;
                };
                return JasRange;
            }());
            exports_1("JasRange", JasRange);
            CellData = /** @class */ (function () {
                function CellData(range) {
                    this.range = range;
                    if (range.getHeight() !== 1 || range.getWidth() !== 1) {
                        throw new Error('CellData is invalid for multi-cell ranges.');
                    }
                    this.data = range.getValue();
                }
                CellData.prototype.isBlank = function () {
                    return this.range.isBlank();
                };
                CellData.prototype.string = function () {
                    if (this.isBlank() || typeof this.data !== 'string') {
                        throw new Error("Expected string in cell " + this.getCellString());
                    }
                    return this.data;
                };
                CellData.prototype.stringOptional = function () {
                    return this.isBlank() ? undefined : this.string();
                };
                CellData.prototype.stringArray = function () {
                    return this.isBlank() ? [] :
                        this.string().split(/,|\n/).map(function (s) { return s.trim(); }).filter(function (s) { return !!s; });
                };
                CellData.prototype.number = function () {
                    if (this.isBlank() || typeof this.data !== 'number') {
                        throw new Error("Expected number in cell " + this.getCellString());
                    }
                    return this.data;
                };
                CellData.prototype.getCellString = function () {
                    return this.range.getSheet().getName() + "!" + this.range.getA1Notation();
                };
                return CellData;
            }());
            exports_1("CellData", CellData);
        }
    };
});
System.register("jas_spreadsheet", [], function (exports_2, context_2) {
    "use strict";
    var JasSpreadsheet;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            JasSpreadsheet = /** @class */ (function () {
                function JasSpreadsheet() {
                }
                JasSpreadsheet.getSpreadsheet = function (spreadsheetId) {
                    return SpreadsheetApp.openById(spreadsheetId);
                };
                JasSpreadsheet.findSheet = function (name, spreadsheetId) {
                    var e_1, _a;
                    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
                    if (!spreadsheet) {
                        throw new Error("Cannot find spreadsheet with id: " + spreadsheetId);
                    }
                    name = name.toLowerCase();
                    var matches = [];
                    try {
                        for (var _b = __values(spreadsheet.getSheets()), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var sheet = _c.value;
                            if (sheet.getName().toLowerCase().includes(name)) {
                                matches.push(sheet);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    if (matches.length > 1) {
                        throw new Error("Multiple sheets '" + matches.map(function (s) { return s.getName(); }).join(', ') + "' matched query '" + name + "'");
                    }
                    if (matches.length === 0) {
                        throw new Error("Expected a sheet with a name including '" + name + "'.");
                    }
                    return matches[0];
                };
                /**
                 * Returns the index of the first matching row. Throws if not found or if
                 * multiple are found.
                 */
                JasSpreadsheet.findRow = function (name, sheet) {
                    name = name.toLowerCase();
                    var headerCol = sheet.getFrozenColumns() || 1;
                    var lastRow = sheet.getLastRow();
                    var rowLabels = [];
                    var matches = [];
                    for (var row = 1; row <= lastRow; row++) {
                        var rowLabel = String(sheet.getRange(row, headerCol).getValue());
                        if (rowLabel.toLowerCase().includes(name)) {
                            matches.push({ row: row, rowLabel: rowLabel });
                        }
                        else if (rowLabel) {
                            rowLabels.push(rowLabel);
                        }
                    }
                    if (matches.length > 1) {
                        throw new Error("Multiple rows '" + matches.map(function (m) { return m.rowLabel; }).join(', ') + "' matched query '" + name + "'");
                    }
                    if (matches.length === 0) {
                        throw new Error("Expected a row with a name including '" + name + "' in " +
                            ("sheet '" + sheet.getName() + "'. ") +
                            ("Row labels: " + rowLabels.join(', ')));
                    }
                    return matches[0].row;
                };
                /**
                 * Returns the index of the first matching column. Throws if not found or if
                 * multiple are found.
                 */
                JasSpreadsheet.findColumn = function (name, sheet) {
                    name = name.toLowerCase();
                    var headerRow = sheet.getFrozenRows() || 1;
                    var lastColumn = sheet.getLastColumn();
                    var columnLabels = [];
                    var matches = [];
                    for (var col = 1; col <= lastColumn; col++) {
                        var columnLabel = String(sheet.getRange(headerRow, col).getValue());
                        if (columnLabel.toLowerCase().includes(name)) {
                            matches.push({ col: col, columnLabel: columnLabel });
                        }
                        else {
                            columnLabels.push(columnLabel);
                        }
                    }
                    if (matches.length > 1) {
                        throw new Error("Multiple columns '" + matches.map(function (m) { return m.columnLabel; }).join(', ') + "' matched query '" + name + "'");
                    }
                    if (matches.length === 0) {
                        throw new Error("Expected a column with a name including '" + name + "' in " +
                            ("sheet '" + sheet.getName() + "'. ") +
                            ("Column labels: " + columnLabels.join(', ')));
                    }
                    return matches[0].col;
                };
                return JasSpreadsheet;
            }());
            exports_2("JasSpreadsheet", JasSpreadsheet);
        }
    };
});
System.register("apihelper", ["jas_range", "jas_spreadsheet"], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (jas_range_1_1) {
                exports_3({
                    "JasRange": jas_range_1_1["JasRange"],
                    "CellData": jas_range_1_1["CellData"]
                });
            },
            function (jas_spreadsheet_1_1) {
                exports_3({
                    "JasSpreadsheet": jas_spreadsheet_1_1["JasSpreadsheet"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("jas_range_test", ["jas_range", "jas_spreadsheet"], function (exports_4, context_4) {
    "use strict";
    var jas_range_2, jas_spreadsheet_2, JasRangeTest;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (jas_range_2_1) {
                jas_range_2 = jas_range_2_1;
            },
            function (jas_spreadsheet_2_1) {
                jas_spreadsheet_2 = jas_spreadsheet_2_1;
            }
        ],
        execute: function () {
            JasRangeTest = /** @class */ (function () {
                function JasRangeTest() {
                    this.name = 'JasRangeTest';
                    /** This is the Lease Spreadsheet Template. */
                    this.spreadsheetId = '1e-xDkyts6jt_2JPGS5i1hX4opVJ9niQ9f0y8YtAvTlw';
                }
                JasRangeTest.prototype.run = function (t) {
                    var sheet = jas_spreadsheet_2.JasSpreadsheet.findSheet('balance', this.spreadsheetId);
                    t.describe('getFixedA1Notation', function () {
                        t.it('adds dollar sign symbol', function () {
                            t.expect(jas_range_2.JasRange.getFixedA1Notation(sheet.getRange(1, 1)))
                                .toEqual("'Balance'!$A$1");
                        });
                        t.it('throws for multi-cell range', function () {
                            var range = sheet.getRange(1, 1, 2, 2);
                            t.expect(function () { return jas_range_2.JasRange.getFixedA1Notation(range); })
                                .toThrow('multi-cell');
                        });
                    });
                    t.describe('CellData', function () {
                        var defaultRange;
                        var defaultOldValue;
                        t.beforeEach(function () {
                            defaultRange = sheet.getRange(2, 2, 1, 1);
                            defaultOldValue = defaultRange.getValue();
                        });
                        t.afterEach(function () { return defaultRange.setValue(defaultOldValue); });
                        t.it('throws for multi-cell range', function () {
                            var range = sheet.getRange(1, 1, 2, 2);
                            t.expect(function () { return new jas_range_2.CellData(range); }).toThrow('multi-cell');
                        });
                        t.it('throws for wrong type', function () {
                            defaultRange.setValue(3);
                            t.expect(function () { return new jas_range_2.CellData(defaultRange).string(); })
                                .toThrow('expected string');
                        });
                        t.it('handles optional calls', function () {
                            defaultRange.clear({ contentsOnly: true });
                            t.expect(new jas_range_2.CellData(defaultRange).stringOptional())
                                .toEqual(undefined);
                        });
                        t.it('finds string array', function () {
                            defaultRange.setValue(',,apples,bananas\ncarrots  ,,\n\ndragonfruit, edameme');
                            t.expect(new jas_range_2.CellData(defaultRange).stringArray()).toEqual(['apples', 'bananas', 'carrots', 'dragonfruit', 'edameme']);
                        });
                    });
                };
                return JasRangeTest;
            }());
            exports_4("default", JasRangeTest);
        }
    };
});
System.register("jas_spreadsheet_test", ["jas_spreadsheet"], function (exports_5, context_5) {
    "use strict";
    var jas_spreadsheet_3, JasSpreadsheetTest;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (jas_spreadsheet_3_1) {
                jas_spreadsheet_3 = jas_spreadsheet_3_1;
            }
        ],
        execute: function () {
            JasSpreadsheetTest = /** @class */ (function () {
                function JasSpreadsheetTest() {
                    this.name = 'JasSpreadsheetTest';
                    /** This is the Lease Spreadsheet Template. */
                    this.spreadsheetId = '1e-xDkyts6jt_2JPGS5i1hX4opVJ9niQ9f0y8YtAvTlw';
                }
                JasSpreadsheetTest.prototype.run = function (t) {
                    var _this = this;
                    var findSheet = function (sheetName) {
                        return jas_spreadsheet_3.JasSpreadsheet.findSheet(sheetName, _this.spreadsheetId);
                    };
                    t.describe('findSheet', function () {
                        t.it('finds present sheet', function () {
                            t.expect(function () { return findSheet('balance'); }).not.toThrow();
                        });
                        t.it('does fuzzy matching, ignoring case', function () {
                            t.expect(function () { return findSheet('BAL'); }).not.toThrow();
                            t.expect(function () { return findSheet('CONFI'); }).not.toThrow();
                        });
                        t.it('throws for absent sheet', function () {
                            t.expect(function () { return findSheet('no such sheet'); }).toThrow('Expected a sheet');
                        });
                        t.describe('with multiple matching sheets', function () {
                            var spreadsheet = jas_spreadsheet_3.JasSpreadsheet.getSpreadsheet(_this.spreadsheetId);
                            var newSheet;
                            t.beforeEach(function () {
                                newSheet = spreadsheet.insertSheet();
                                newSheet.setName('Balad'); // To share prefix with 'Balance' sheet.
                            });
                            t.afterEach(function () {
                                spreadsheet.deleteSheet(newSheet);
                            });
                            t.it('throws for ambiguous query', function () {
                                t.expect(function () { return findSheet('bala'); }).toThrow('multiple sheets');
                            });
                        });
                    });
                    t.describe('findColumn', function () {
                        var sheet = findSheet('balance');
                        t.it('finds present column', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findColumn('description', sheet); })
                                .not.toThrow();
                        });
                        t.it('does fuzzy matching, ignoring case', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findColumn('DESCR', sheet); }).not.toThrow();
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findColumn('TRANSACT', sheet); })
                                .not.toThrow();
                        });
                        t.it('throws for absent column', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findColumn('no such column', sheet); })
                                .toThrow('Expected a column');
                        });
                        t.it('throws for ambiguous column', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findColumn('d', sheet); })
                                .toThrow('multiple columns');
                        });
                    });
                    t.describe('findRow', function () {
                        var sheet = findSheet('config');
                        t.it('finds present row', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findRow('interest rate', sheet); })
                                .not.toThrow();
                        });
                        t.it('does fuzzy matching, ignoring case', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findRow('PAYMENT T', sheet); })
                                .not.toThrow();
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findRow('EMAIL DIS', sheet); })
                                .not.toThrow();
                        });
                        t.it('throws for absent row', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findRow('no such row', sheet); })
                                .toThrow('Expected a row');
                        });
                        t.it('throws for ambiguous row', function () {
                            t.expect(function () { return jas_spreadsheet_3.JasSpreadsheet.findRow('customer', sheet); })
                                .toThrow('multiple rows');
                        });
                    });
                };
                return JasSpreadsheetTest;
            }());
            exports_5("default", JasSpreadsheetTest);
        }
    };
});
// The name SSLib here is important. It must match
// `depencies.libraries[n].userSymbol` in appscript.json for code that depends
// on this lib. E.g.
// https://github.com/jamesoguntebi/AS_LeaseLib/blob/master/appsscript.json
System.register("ss_api", ["apihelper"], function (exports_6, context_6) {
    "use strict";
    var SSLib;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (SSLib_1) {
                SSLib = SSLib_1;
            }
        ],
        execute: function () {// The name SSLib here is important. It must match
            // `depencies.libraries[n].userSymbol` in appscript.json for code that depends
            // on this lib. E.g.
            // https://github.com/jamesoguntebi/AS_LeaseLib/blob/master/appsscript.json
            exports_6("SSLib", SSLib);
        }
    };
});
System.register("testing/testrunner", ["jas_range_test", "jas_spreadsheet_test", "jas_api"], function (exports_7, context_7) {
    "use strict";
    var jas_range_test_1, jas_spreadsheet_test_1, jas_api_1, TestRunner;
    var __moduleName = context_7 && context_7.id;
    function runTests(params) {
        if (params === void 0) { params = {}; }
        if (typeof params === 'string') {
            params = { testClassNames: params.split(',') };
        }
        TestRunner.run(params);
        return Logger.getLog();
    }
    exports_7("runTests", runTests);
    function runTestsAndHideSuccesses(params) {
        if (params === void 0) { params = {}; }
        if (typeof params === 'string') {
            params = { testClassNames: params.split(',') };
        }
        params.showSuccesses = false;
        TestRunner.run(params);
        return Logger.getLog();
    }
    exports_7("runTestsAndHideSuccesses", runTestsAndHideSuccesses);
    function runTestsWithLogs(params) {
        if (params === void 0) { params = {}; }
        if (typeof params === 'string') {
            params = { testClassNames: params.split(',') };
        }
        params.suppressLogs = false;
        TestRunner.run(params);
        return Logger.getLog();
    }
    exports_7("runTestsWithLogs", runTestsWithLogs);
    return {
        setters: [
            function (jas_range_test_1_1) {
                jas_range_test_1 = jas_range_test_1_1;
            },
            function (jas_spreadsheet_test_1_1) {
                jas_spreadsheet_test_1 = jas_spreadsheet_test_1_1;
            },
            function (jas_api_1_1) {
                jas_api_1 = jas_api_1_1;
            }
        ],
        execute: function () {
            TestRunner = /** @class */ (function () {
                function TestRunner() {
                }
                TestRunner.run = function (_a) {
                    var _b = _a.suppressLogs, suppressLogs = _b === void 0 ? true : _b, _c = _a.showSuccesses, showSuccesses = _c === void 0 ? true : _c, _d = _a.testClassNames, testClassNames = _d === void 0 ? undefined : _d;
                    var testClasses = [
                        jas_range_test_1["default"],
                        jas_spreadsheet_test_1["default"],
                    ];
                    if (testClassNames) {
                        var testClassesSet_1 = new Set(testClassNames);
                        testClasses = testClasses.filter(function (tc) { return testClassesSet_1.has(tc.name); });
                        if (!testClasses.length) {
                            throw new Error("No tests found among " + testClassNames);
                        }
                    }
                    var tests = testClasses.map(function (tc) { return new tc(); });
                    jas_api_1.JASLib.TestRunner.run(tests, { suppressLogs: suppressLogs, showSuccesses: showSuccesses });
                };
                return TestRunner;
            }());
            exports_7("default", TestRunner);
        }
    };
});

import JasRangeTest from "../jas_range_test";
import JasSpreadsheetTest from "../jas_spreadsheet_test";
import { JASLib } from "jas_api"

export function runTests(params: TestRunnerOptions | string = {}) {
  if (typeof params === 'string') {
    params = {testClassNames: params.split(',')};
  }
  TestRunner.run(params as TestRunnerOptions);
  return Logger.getLog();
}

export function runTestsAndHideSuccesses(
    params: TestRunnerOptions | string = {}) {
  if (typeof params === 'string') {
    params = {testClassNames: params.split(',')};
  }
  params.showSuccesses = false;
  TestRunner.run(params as TestRunnerOptions);
  return Logger.getLog();
}

export function runTestsWithLogs(params: TestRunnerOptions | string = {}) {
  if (typeof params === 'string') {
    params = {testClassNames: params.split(',')};
  }
  params.suppressLogs = false;
  TestRunner.run(params as TestRunnerOptions);
  return Logger.getLog();
}

export default class TestRunner {
  static run({
    suppressLogs = true,
    showSuccesses = true,
    testClassNames = undefined,
  }: TestRunnerOptions) {

    let testClasses: Array<new() => JASLib.Test> = [
      JasRangeTest,
      JasSpreadsheetTest,
    ];

    if (testClassNames) {
      const testClassesSet = new Set(testClassNames);
      testClasses = testClasses.filter(tc => testClassesSet.has(tc.name));
      if (!testClasses.length) {
        throw new Error(`No tests found among ${testClassNames}`)
      }
    }

    const tests = testClasses.map(tc => new tc());
    JASLib.TestRunner.run(tests, {suppressLogs, showSuccesses});
  }
}

interface TestRunnerOptions extends JASLib.TestRunnerOptions {
  testClassNames?: string[];
}
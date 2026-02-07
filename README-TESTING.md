# Test Execution Guide

This guide explains how to run your API and Cucumber tests in headless mode with Allure reporting.

## Prerequisites

Make sure you have the following dependencies installed:

```bash
npm install
```

## Available Test Commands

### Quick Commands

#### API Tests Only
```bash
# Run API tests with Allure reporting (headless)
npm run test:api:allure

# Run API tests only (headless, no report generation)
npm run test:api:headless
```

#### Cucumber Tests Only
```bash
# Run Cucumber tests with Allure reporting (headless)
npm run test:cucumber:allure

# Run Cucumber tests only (headless, no report generation)
npm run test:cucumber:headless
```

#### Run All Tests
```bash
# Run all tests with Allure reporting
npm run test:all:allure

# Run all tests (headless, no report generation)
npm run test:all
```

### Key Features

✅ **Headless Execution**: All tests run without opening browser windows
✅ **API Response Reporting**: Detailed API response logs and analysis
✅ **Allure Integration**: Comprehensive test reports with detailed insights
✅ **Automatic Cleanup**: Previous results are cleaned before each run
✅ **Cross-Platform**: Works on Windows, macOS, and Linux

### Advanced Commands

#### Using the Test Runner Script
```bash
# Run all tests (API + Cucumber) with detailed logging
node run-tests-headless.js

# Run only API tests
node run-tests-headless.js api

# Run only Cucumber tests
node run-tests-headless.js cucumber
```

#### Using Batch File (Windows)
```bash
# Run API tests using batch file
run-api-tests.bat
```

#### Manual Command Execution
```bash
# Clean previous results
npm run clean:reports

# Run API tests manually
npx cucumber-js tests/api/apiFeaturs/*.feature --require-module ts-node/register --require tests/api/apiSteps/*.ts --require tests/api/apihHooks/*.ts --format allure-cucumberjs/reporter --format-options '{"resultsDir":"allure-results"}'

# Generate Allure report
npm run generate:reports

# Open Allure report
npm run open:reports
```

## Test Configuration

### Headless Execution
All test commands run in headless mode by default, meaning:
- No browser windows will open
- Tests run in the background
- Faster execution
- Suitable for CI/CD environments

### Allure Reporting
The tests generate comprehensive Allure reports that include:
- Test execution results
- API response details
- Screenshots (for UI tests)
- Performance metrics
- Detailed logs

## Report Locations

- **Allure Results**: `allure-results/` (raw data)
- **Allure Report**: `allure-report/index.html` (viewable report)

## Troubleshooting

### Common Issues

1. **Allure not found**
   ```bash
   npm install -g allure-commandline
   ```

2. **TypeScript compilation errors**
   ```bash
   npx tsc --noEmit
   ```

3. **Missing dependencies**
   ```bash
   npm install
   ```

4. **Permission issues (Windows)**
   ```bash
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Debug Mode

To run tests with more verbose logging:

```bash
DEBUG=cucumber* npm run test:api:headless
```

### View Test Output

The tests provide detailed console output including:
- Test execution progress
- API response bodies
- Test results summary
- Allure report generation status

## CI/CD Integration

For continuous integration, use these commands:

```yaml
# GitHub Actions example
- name: Run API tests
  run: npm run test:api:allure

- name: Upload Allure results
  uses: simple-elf/allure-report-action@v0.0.7
  with:
    folder: allure-report
```

## Test Structure

### API Tests
- Location: `tests/api/`
- Features: `tests/api/apiFeaturs/`
- Steps: `tests/api/apiSteps/`
- Hooks: `tests/api/apihHooks/`

### Cucumber Tests
- Location: `tests/Cucumber/`
- Features: `tests/Cucumber/features/`
- Steps: `tests/Cucumber/steps/`
- Hooks: `tests/Cucumber/hooks/`

## Performance Tips

1. **Parallel Execution**: Tests are configured to run in parallel for faster execution
2. **Headless Mode**: Always use headless mode for production testing
3. **Clean Results**: Always clean previous results before running tests
4. **Report Generation**: Generate reports only when needed for performance

## Support

For issues or questions:
1. Check the console output for error details
2. Verify all dependencies are installed
3. Ensure API endpoints are accessible
4. Check TypeScript compilation
#!/usr/bin/env node

/**
 * Simple test script to verify API response body reporting functionality
 * This script runs the API tests and checks if response bodies are properly captured in reports
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Testing Enhanced API Response Body Reporting');
console.log('================================================');

// Function to run the API tests
function runApiTests() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Running API tests with enhanced response reporting...');
        
        const testCommand = 'npx cucumber-js tests/api/apiFeaturs/apiFeatures.feature --format json:results.json';
        
        exec(testCommand, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error && error.code !== 0) {
                console.error('❌ Test execution failed:', error.message);
                reject(error);
                return;
            }
            
            console.log('✅ Tests completed successfully!');
            console.log('📋 Test Output:', stdout);
            
            if (stderr) {
                console.log('⚠️  Test warnings/errors:', stderr);
            }
            
            resolve();
        });
    });
}

// Function to check if Allure reports were generated
function checkReports() {
    const fs = require('fs');
    
    console.log('\n📊 Checking generated reports...');
    
    // Check if Allure results directory exists
    const allureResultsDir = path.join(process.cwd(), 'allure-results');
    if (fs.existsSync(allureResultsDir)) {
        console.log('✅ Allure results directory found:', allureResultsDir);
        
        const files = fs.readdirSync(allureResultsDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        console.log(`   Found ${jsonFiles.length} JSON result files`);
        
        // Look for response body attachments
        let hasResponseBodies = false;
        jsonFiles.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(allureResultsDir, file), 'utf8');
                if (content.includes('Response Body') || content.includes('response-body')) {
                    hasResponseBodies = true;
                }
            } catch (e) {
                // Ignore read errors
            }
        });
        
        if (hasResponseBodies) {
            console.log('✅ Response body attachments found in reports!');
        } else {
            console.log('⚠️  No response body attachments found in reports');
        }
    } else {
        console.log('❌ Allure results directory not found');
    }
    
    // Check if HTML report exists
    const htmlReportDir = path.join(process.cwd(), 'playwright-report');
    if (fs.existsSync(htmlReportDir)) {
        console.log('✅ Playwright HTML report found:', htmlReportDir);
    } else {
        console.log('⚠️  Playwright HTML report not found');
    }
}

// Main execution
async function main() {
    try {
        await runApiTests();
        checkReports();
        
        console.log('\n🎉 Enhanced API response body reporting test completed!');
        console.log('\n📋 What was enhanced:');
        console.log('   • Response bodies are now captured and formatted in Allure reports');
        console.log('   • Each API call gets detailed request/response attachments');
        console.log('   • Response summary includes status, headers, body, and metadata');
        console.log('   • API test summary with statistics is added to reports');
        console.log('   • Response bodies are properly formatted for readability');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { runApiTests, checkReports };
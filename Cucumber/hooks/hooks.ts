import { After,Before,AfterAll,BeforeAll,Status,setDefaultTimeout } from "@cucumber/cucumber";
// import { Browser, BrowserContext, Page } from "@playwright/test";
import { chromium, Browser,BrowserContext, expect } from '@playwright/test';
import * as fs from 'fs'; 

let browser: Browser;
let context: BrowserContext;
// let page: Page;


BeforeAll(async function () {
    browser = await chromium.launch({ headless: false });
    
});

// Before(async function () {
// context = await browser.newContext();
//     this.page = await context.newPage();
// });

// After(async function () {
//     await this.page?.close();
//     await context?.close();
// });
Before(async function () {
    if (!browser) {
        browser = await chromium.launch({ headless: false });
    }
    // sceparate context and page for each scenario to ensure isolation
    this.context = await browser.newContext();
    this.page = await this.context.newPage();

    //create screenshots directory 
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }
});

After(async function (scenario) {
    // take screenshot on failure
    if (scenario.result?.status === Status.FAILED) {
        const path = `screenshots/failed-${scenario.pickle.name}.png`;
        await this.page.screenshot({ path: path });
    }

    // close page and context after each scenario
    await this.page?.close();
    await this.context?.close();
});

AfterAll(async function () {
    await browser.close();
});
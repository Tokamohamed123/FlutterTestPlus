import { After,Before,AfterAll,BeforeAll,Status,setDefaultTimeout } from "@cucumber/cucumber";
// import { Browser, BrowserContext, Page } from "@playwright/test";
import { chromium, Browser,BrowserContext, expect } from '@playwright/test';


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
    // تشغيل المتصفح إذا لم يكن يعمل
    if (!browser) {
        browser = await chromium.launch({ headless: false });
    }
    // إنشاء سياق (Context) جديد تماماً ومعزول لكل سيناريو
    context = await browser.newContext();
    this.page = await context.newPage();
});

After(async function (scenario) {
    // إغلاق الصفحة والـ Context فوراً بعد نهاية كل سيناريو
    await this.page?.close();
    await context?.close();
    
    if (scenario.result?.status === Status.FAILED) {
        console.log(`Scenario failed: ${scenario.pickle.name}`);
    }
});

AfterAll(async function () {
    await browser.close();
});
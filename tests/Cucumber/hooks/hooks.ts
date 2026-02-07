import { After,Before,AfterAll,BeforeAll,Status,setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, Browser,BrowserContext, expect, Request, Response } from '@playwright/test';
import * as fs from 'fs'; 
import { allure } from 'allure-playwright';

let browser: Browser;
let context: BrowserContext;

BeforeAll(async function () {
    browser = await chromium.launch({ headless: false });
});

Before(async function () {
    if (!browser) {
        browser = await chromium.launch({ headless: false });
    }
    // separate context and page for each scenario to ensure isolation
    this.context = await browser.newContext();
    this.page = await this.context.newPage();

    // create screenshots directory 
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }
});

After(async function (scenario) {
    // take screenshot on failure
    if (scenario.result?.status === Status.FAILED) {
        const path = `screenshots/failed-${scenario.pickle.name}.png`;
        await this.page.screenshot({ path: path });
        
        // attach screenshot to allure report
        if (fs.existsSync(path)) {
            await allure.attachment('Failed Screenshot', fs.readFileSync(path), 'image/png');
        }
    }

    // capture network requests and responses for the scenario
    try {
        // Capture network activity during the test
        const networkData = {
            requests: [] as Array<{
                url: string;
                method: string;
                headers: { [key: string]: string };
                postData: string | null;
            }>,
            responses: [] as Array<{
                url: string;
                status: number;
                headers: { [key: string]: string };
                body: string;
            }>
        };
        
        // Listen for requests and responses
        this.context.on('request', (request: Request) => {
            networkData.requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                postData: request.postData()
            });
        });
        
        this.context.on('response', async (response: Response) => {
            try {
                const body = await response.text();
                networkData.responses.push({
                    url: response.url(),
                    status: response.status(),
                    headers: response.headers(),
                    body: body
                });
            } catch (e) {
                networkData.responses.push({
                    url: response.url(),
                    status: response.status(),
                    headers: response.headers(),
                    body: 'Could not capture response body'
                });
            }
        });
        
        // Wait a moment to capture any pending network activity
        await this.page.waitForTimeout(1000);
        
        if (networkData.requests.length > 0 || networkData.responses.length > 0) {
            await allure.attachment('Network Requests/Responses', JSON.stringify(networkData, null, 2), 'application/json');
        }
    } catch (error) {
        console.log('Could not capture network data:', error);
    }

    // close page and context after each scenario
    await this.page?.close();
    await this.context?.close();
});

AfterAll(async function () {
    await browser.close();
});

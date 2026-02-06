import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('navigate to the Flutter Angular app', { timeout: 60000 }, async function () {
    await this.page.goto('https://flutter-angular.web.app/#/', { waitUntil: 'load' });
    await this.page.waitForTimeout(3000); // انتظار إضافي لتحميل الـ Canvas
});

Given('enable Flutter accessibility semantics', { timeout: 60000 }, async function () {
    // 1. الضغط التقليدي لتفعيل السيمانتكس
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');

    // 2. السطر الجديد (اضيفيه هنا): 
    // هذا السطر يبحث عن عنصر مخفي في فلاتر (placeholder) ويضغط عليه لإجباره على إظهار النصوص
    await this.page.click('flt-semantics-placeholder', { force: true, timeout: 2000 }).catch(() => {
        console.log("Semantics placeholder not found, skipping...");
    });

    // 3. انتظار كافٍ لبناء شجرة العناصر
    await this.page.waitForTimeout(5000); 
});

When('I click the "+" increment button', { timeout: 60000 }, async function () {
    const btn = this.page.locator('flt-semantics[aria-label="Increment"]').first();
    
    await btn.waitFor({ state: 'visible' });

    // استخدام dispatchEvent('click') أحياناً يكون أضمن في فلاتر لمنع التكرار
    // أو استخدام click مع clickCount: 1
    await btn.click({ clickCount: 1 }); 
    
    // أهم سطر: انتظار بسيط للتأكد من أن فلاتر سجل ضغطة واحدة فقط
    await this.page.waitForTimeout(1000); 
});

When('I click on a neutral area of the screen', { timeout: 60000 }, async function () {
    await this.page.mouse.click(10, 10);
    await this.page.waitForTimeout(1000);
});

// Then('The counter should display {string}', { timeout: 60000 }, async function (expectedValue: string) {
//     // استخراج الرقم (0 أو 1)
//     const num = expectedValue.match(/\d+/)![0];
    
//     // البحث عن الرقم في أي مكان (Text, Aria-label, Title)
//     const counter = this.page.locator(`[aria-label*="${num}"], flt-semantics:has-text("${num}"), text="${expectedValue}"`).first();
    
//     // محاولة الانتظار المرن
//     await expect(async () => {
//         const isVisible = await counter.isVisible();
//         if (!isVisible) {
//             // محاولة إعادة تفعيل الـ semantics إذا اختفت
//             await this.page.keyboard.press('Tab');
//         }
//         expect(await counter.textContent() || await counter.getAttribute('aria-label')).toContain(num);
//     }).toPass({ timeout: 15000 });
// });


// Then('The counter should display {string}', { timeout: 60000 }, async function (expectedValue: string) {
//     // استخراج الرقم فقط من النص (مثلاً "1" من "Index: 1")
//     const num = expectedValue.match(/\d+/)![0];

//     // البحث عن العنصر الذي يحتوي على الرقم في الـ aria-label
//     // نستخدم locator يشمل المنتصف تقريباً
//     const counterLocator = this.page.locator(`flt-semantics[aria-label*="${num}"]`).first();

//     // الانتظار حتى يظهر العنصر وتتغير قيمته
//     await expect(counterLocator).toBeAttached({ timeout: 15000 });
    
//     const ariaLabel = await counterLocator.getAttribute('aria-label');
//     console.log(`Current Aria-Label: ${ariaLabel}`); // للـ Debugging
    
//     expect(ariaLabel).toContain(num);
// });
//////////////////////////solve /////////////////////////////////////
// Then('The counter should display {string}', { timeout: 60000 }, async function (expectedValue: string) {
//     // 1. جلب مقاسات الشاشة
//     const size = await this.page.viewportSize();
//     if (!size) throw new Error("Could not get viewport size");

//     const centerX = size.width / 2;
//     const centerY = size.height / 2;

//     // 2. التصحيح هنا: إضافة أنواع البيانات { x, y }: { x: number, y: number }
//     const foundText = await this.page.evaluate(({ x, y }: { x: number, y: number }) => {
//         const element = document.elementFromPoint(x, y);
//         return element?.getAttribute('aria-label') || element?.textContent || "لم يتم العثور على نص";
//     }, { x: centerX, y: centerY });

//     console.log(`Text at center: ${foundText}`);
    
//     // استخراج الرقم المطلوب للتحقق
//     const expectedNum = expectedValue.match(/\d+/)![0];
//     expect(foundText).toContain(expectedNum);
// });

///////////////////////////////
Then('The counter should display {string}', { timeout: 60000 }, async function (expectedValue: string) {
    const expectedNum = expectedValue.match(/\d+/)![0];

    // استخدام كود الـ Global Scan الذي كتبتيه (الموجود في صورتك الأخيرة)
    const result = await this.page.evaluate((num: string) => {
        const elements = Array.from(document.querySelectorAll('flt-semantics, [aria-label]'));
        const labels = elements.map(el => el.getAttribute('aria-label') || "").filter(l => l !== "");
        
        // البحث عن النص الذي يحتوي على الرقم
        const found = labels.find(l => l.includes(`Index: ${num}`) || l.includes(num));
        
        return {
            found: found ? found : "NOT_FOUND",
            actualLabels: labels
        };
    }, expectedNum);

    console.log(`--- Test Result ---`);
    console.log(`Expected: ${expectedNum}`);
    console.log(`Actual Labels Found:`, result.actualLabels);

    // إذا وجد الرقم 2، سيظهر هنا في الـ Error بوضوح
    if (result.found === "NOT_FOUND") {
         throw new Error(`Expected ${expectedNum} but found: ${result.actualLabels.join(', ')}`);
    }

    expect(result.found).toContain(expectedNum);
});
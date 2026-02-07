import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { apiContext } from '../apihHooks/apihooks';
import { allure } from 'allure-playwright';

let baseUrl: string;
let userEmail: string;
let currentPassword: string;
let token: string;
let noteId: string;
let originalNoteData: any; //to store original note data for updates

// Enhanced response body reporting function (maintained for backward compatibility)
async function reportApiResponse(
    stepName: string, 
    method: string, 
    url: string, 
    response: any, 
    requestData?: any,
    context?: any
) {
    const responseBody = await response.json();
    const responseHeaders = response.headers();
    
    // Create detailed response summary
    const responseSummary = {
        step: stepName,
        method: method,
        url: url,
        status: response.status(),
        statusText: response.statusText(),
        headers: responseHeaders,
        body: responseBody,
        timestamp: new Date().toISOString(),
        size: JSON.stringify(responseBody).length,
        contentType: responseHeaders['content-type'] || 'application/json'
    };
    
    // Store in test context for comprehensive reporting
    if (context) {
        if (!context.apiResponses) context.apiResponses = [];
        context.apiResponses.push(responseSummary);
    }
    
    // Create formatted response body for better readability
    const formattedResponseBody = JSON.stringify(responseBody, null, 2);
    
    // Add to Allure report with enhanced formatting using this.attach
    await allure.step(`${stepName} - API Response`, async () => {
        // Use this.attach for Allure attachments
        if (context && context.attach) {
            await context.attach(`${stepName} - Request Details`, JSON.stringify({
                method: method,
                url: url,
                headers: requestData?.headers || {},
                body: requestData?.data || {},
                timestamp: new Date().toISOString()
            }, null, 2), 'application/json');
            
            await context.attach(`${stepName} - Response Details`, JSON.stringify(responseSummary, null, 2), 'application/json');
            
            await context.attach(`${stepName} - Response Body`, formattedResponseBody, 'application/json');
        } else {
            // Fallback to allure.attachment if this.attach is not available
            await allure.attachment(`${stepName} - Request Details`, JSON.stringify({
                method: method,
                url: url,
                headers: requestData?.headers || {},
                body: requestData?.data || {},
                timestamp: new Date().toISOString()
            }, null, 2), 'application/json');
            
            await allure.attachment(`${stepName} - Response Details`, JSON.stringify(responseSummary, null, 2), 'application/json');
            
            await allure.attachment(`${stepName} - Response Body`, formattedResponseBody, 'application/json');
        }
        
        // Add response status as a label for better filtering
        allure.label('api-status', response.status().toString());
        allure.label('api-method', method);
        allure.label('api-endpoint', url.split('/').pop() || 'unknown');
    });
    
    return responseBody;
}

// Automatic response attachment helper function
async function autoAttachResponse(
    this: any,
    stepName: string, 
    method: string, 
    url: string, 
    response: any, 
    requestData?: any
) {
    // Get the auto-attach function from context
    const autoAttachFunction = this.autoAttachApiResponse;
    if (autoAttachFunction) {
        return await autoAttachFunction(stepName, method, url, response, requestData, this);
    } else {
        // Fallback to manual reporting if auto-attach is not available
        return await reportApiResponse(stepName, method, url, response, requestData, this);
    }
}

Given('The API base URL is {string}', async function (url: string) {
    baseUrl = url;
});

// --- 1. Registration ---
When('I register a new user with name {string} and password {string}', async function (name, pass) {
    userEmail = `user_${Date.now()}@test.com`;
    currentPassword = pass;
    
    const requestData = {
        headers: {},
        data: { name, email: userEmail, password: currentPassword }
    };
    
    const res = await apiContext.post(`${baseUrl}/users/register`, {
        data: { name, email: userEmail, password: currentPassword }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Register User',
        'POST',
        `${baseUrl}/users/register`,
        res,
        requestData,
        this
    );
    
    expect(res.status()).toBe(201); // التحقق من كود الحالة 201 (Created)
});

Then('The user should be created successfully', async function () {
    console.log(`✅ User Created: ${userEmail}`);
});

// --- 2. Password Management ---
When('I log in to get the access token', async function () {
    const requestData = {
        headers: {},
        data: { email: userEmail, password: currentPassword }
    };
    
    const res = await apiContext.post(`${baseUrl}/users/login`, {
        data: { email: userEmail, password: currentPassword }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Login User',
        'POST',
        `${baseUrl}/users/login`,
        res,
        requestData,
        this
    );
    
    token = responseBody.data.token;
});

When('I change my password from {string} to {string}', async function (oldPass, newPass) {
    const requestData = {
        headers: { 'x-auth-token': token },
        data: { currentPassword: oldPass, newPassword: newPass }
    };
    
    const res = await apiContext.post(`${baseUrl}/users/change-password`, {
        headers: { 'x-auth-token': token },
        data: { currentPassword: oldPass, newPassword: newPass }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Change Password',
        'POST',
        `${baseUrl}/users/change-password`,
        res,
        requestData,
        this
    );
    
    expect(res.status()).toBe(200);
});

Then('The password should be updated successfully', async function () {
    console.log('✅ Password Update Verified');
});

When('I log in with the new password {string}', async function (newPass) {
    currentPassword = newPass;
    
    const requestData = {
        headers: {},
        data: { email: userEmail, password: currentPassword }
    };
    
    const res = await apiContext.post(`${baseUrl}/users/login`, {
        data: { email: userEmail, password: currentPassword }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Login with New Password',
        'POST',
        `${baseUrl}/users/login`,
        res,
        requestData,
        this
    );
    
    token = responseBody.data.token; // تحديث التوكن بالباسورد الجديد
    
    expect(res.status()).toBe(200);
});

// --- 3. Note Management (Create & Update) ---
When('I create a new note with title {string} and description {string}', async function (title, desc) {
    const requestData = {
        headers: { 'x-auth-token': token },
        data: { title, description: desc, category: 'Home' }
    };
    
    const res = await apiContext.post(`${baseUrl}/notes`, {
        headers: { 'x-auth-token': token },
        data: { title, description: desc, category: 'Home' }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Create Note',
        'POST',
        `${baseUrl}/notes`,
        res,
        requestData,
        this
    );
    
    noteId = responseBody.data.id;
    originalNoteData = responseBody.data;
    
    expect(res.status()).toBe(200);
});

When('I update the note title to {string}', async function (newTitle) {
    const requestData = {
        headers: { 'x-auth-token': token },
        data: { ...originalNoteData, title: newTitle }
    };
    
    const res = await apiContext.put(`${baseUrl}/notes/${noteId}`, {
        headers: { 'x-auth-token': token },
        data: { ...originalNoteData, title: newTitle }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Update Note',
        'PUT',
        `${baseUrl}/notes/${noteId}`,
        res,
        requestData,
        this
    );
    
    expect(res.status()).toBe(200);
});

Then('The note should reflect the updated title {string}', async function (expectedTitle) {
    const requestData = {
        headers: { 'x-auth-token': token }
    };
    
    const res = await apiContext.get(`${baseUrl}/notes/${noteId}`, {
        headers: { 'x-auth-token': token }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Get Note',
        'GET',
        `${baseUrl}/notes/${noteId}`,
        res,
        requestData,
        this
    );
    
    expect(responseBody.data.title).toBe(expectedTitle);
});

// --- 4. Delete & Verify ---
When('I delete the current note', async function () {
    const requestData = {
        headers: { 'x-auth-token': token }
    };
    
    const res = await apiContext.delete(`${baseUrl}/notes/${noteId}`, {
        headers: { 'x-auth-token': token }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Delete Note',
        'DELETE',
        `${baseUrl}/notes/${noteId}`,
        res,
        requestData,
        this
    );
    
    expect(res.status()).toBe(200);
});

Then('The note should no longer exist in the system', async function () {
    const requestData = {
        headers: { 'x-auth-token': token }
    };
    
    const res = await apiContext.get(`${baseUrl}/notes/${noteId}`, {
        headers: { 'x-auth-token': token }
    });
    
    // Use enhanced response reporting
    const responseBody = await reportApiResponse(
        'Verify Note Deletion',
        'GET',
        `${baseUrl}/notes/${noteId}`,
        res,
        requestData,
        this
    );
    
    expect(res.status()).toBe(404); // التحقق من أن النوت غير موجودة فعلياً
    console.log('✅ Deletion Verified');
});

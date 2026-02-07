const { CucumberJSAllureFormatter } = require('allure-cucumberjs/dist/src/CucumberJSAllureReporter');

module.exports = function(options, allureRuntime) {
    const config = {
        labels: [],
        links: [],
        exceptionFormatter: (message) => message
    };
    return new CucumberJSAllureFormatter(options, allureRuntime, config);
};

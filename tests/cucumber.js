module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      // تأكدي من كتابة الأسماء الصحيحة للمجلدات كما تظهر في الـ Explorer لديكِ
      'tests/Cucumber/hooks/*.ts',
      'tests/Cucumber/steps/*.ts',
      'tests/api/apihHooks/*.ts', // تأكدي من سبيرنج apihHooks
      'tests/api/apiSteps/*.ts'
    ],
    paths: [
      'tests/api/apiFeaturs/*.feature', // تأكدي من سبيرنج apiFeaturs
      'tests/Cucumber/features/*.feature'
    ],
    format: 
    ["summary", "progress-bar",
      ["allure-cucumberjs/reporter", { resultsDir: "allure-results" }]
  ],
    publishQuiet: true
  }
}
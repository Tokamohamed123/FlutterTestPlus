module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      './Cucumber/hooks/*.ts', // تأكدي من إضافة هذا المسار
      './Cucumber/steps/*.ts'
    ],
    paths: [
      './Cucumber/features/*.feature'
    ],
    format: ['summary', 'progress-bar'],
    publishQuiet: true
  }
}
module.exports = {
  name: 'shell',
  filename: 'remoteEntry.js',
  exposes: {
    './ChatbotModule': './src/app/mfes/chatbot/chatbot-mfe.component.ts',
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/router': { singleton: true, strictVersion: true },
    '@angular/forms': { singleton: true, strictVersion: true }
  }
};
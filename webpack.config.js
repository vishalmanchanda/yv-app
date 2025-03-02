const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatbotModule': './src/app/mfes/chatbot/chatbot-mfe.component.ts',
      },
      shared: {
        '@angular/core': { singleton: true },
        '@angular/common': { singleton: true },
        '@angular/router': { singleton: true },
        '@angular/forms': { singleton: true }
      }
    })
  ]
};

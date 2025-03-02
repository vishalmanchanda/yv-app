const { withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = withModuleFederationPlugin({
  name: 'shell',
  remotes: {
    mfe1: "http://localhost:4201/remoteEntry.js"
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/router': { singleton: true, strictVersion: true }
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "chatbot",
      filename: "remoteEntry.js",
      exposes: {
        "./ChatbotModule": "./src/app/mfes/chatbot/chatbot-mfe.component.ts",
      },
      shared: {
        "@angular/core": { singleton: true },
        "@angular/common": { singleton: true },
        "@angular/router": { singleton: true },
        "@angular/forms": { singleton: true }
      },
    }),
  ]
});

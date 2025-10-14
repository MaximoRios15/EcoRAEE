const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reducir workers para usar menos memoria
config.maxWorkers = 1;

// Excluir archivos innecesarios del bundle
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/.*/,
];

module.exports = config;

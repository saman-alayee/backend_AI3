const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load the YAML file
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

module.exports = {
  serveSwaggerUI: swaggerUi.serve,
  setupSwaggerUI: swaggerUi.setup(swaggerDocument),
};

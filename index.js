const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());

const adminController = require("./controllers/adminController");
const usersController = require("./controllers/usersController");
const notesController = require("./controllers/notesController");

app.use("/api/admin", adminController);
app.use("/api/user", usersController);
app.use("/api/notes", notesController);

const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

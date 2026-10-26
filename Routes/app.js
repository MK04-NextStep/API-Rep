const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const loadApi = require('../Docs/loader')
const authRoutes = require('./auth.routes');
const workspaceRoutes = require('./workspace.routes');
const memberRoutes = require('./member.routes');
const apiRoutes = require('./api.routes')
const errorMiddleware = require('../Middleware/error.middleware')
const requestLogger = require('../Middleware/logger.middleware')
const fileRoutes = require('../Routes/file.routes')

const helmet = require('helmet')
const {globalLimiter} = require('../Config/rateLimit')
const cors = require('cors')

const app = express();

app.use(helmet());
app.use(globalLimiter)
app.use(cors({
    origin: "*" //frontend host
}))

app.use(express.json());

app.use(requestLogger);

app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/workspace", workspaceRoutes);
app.use("/member", memberRoutes);
app.use("/api", apiRoutes);
app.use('/file', fileRoutes);

const setupSwagger = async () => {
    const swaggerSpec = await loadApi();

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
};

setupSwagger().catch((error) => {
    console.error("Failed to load OpenAPI:", error);
}); //connecting swagger to express

app.use(errorMiddleware);

module.exports = app;
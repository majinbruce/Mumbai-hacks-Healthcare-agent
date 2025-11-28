import express from "express";
import routes from "./routes/routes.js";
import { handleError } from "./utils/appErrorHandler.js";
import errorMiddleware from "./middleware/errorMiddleWare.js";

import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", routes);

app.all("*", (req, res, next) => {
  throw handleError(`Can't find ${req.originalUrl} on the server!`, 404);
});

// centralised error handling placed at the end
app.use(errorMiddleware);

export default app;

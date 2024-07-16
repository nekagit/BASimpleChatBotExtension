import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import feedLLMRoutes from "./routes/feedLLM.js";
import queryRoutes from "./routes/query.js";

const corsOptions = {
  origin: true,
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use("/query", queryRoutes);
app.use("/feed_llm", feedLLMRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import app from "./app.js";
import connectMongoDB from './db/connectMongoDB.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  connectMongoDB();
});
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors({ origin: ['http://localhost:4000/'] }));
app.get('/', (req, res) => {
  res.json('server is up!');
});
app.use(express.json());

app.use(bodyParser.json());

export default app;

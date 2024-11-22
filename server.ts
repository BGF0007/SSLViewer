import express from 'express';
import cors from 'cors';
import { handler as certificatesHandler } from './api/certificates';
import { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Wrap Vercel handler to work with Express
const adaptVercelToExpress = (vercelHandler: Function) => {
  return async (req: Request, res: Response) => {
    // Add Vercel-specific properties that our handler might expect
    const vercelReq = {
      ...req,
      body: req.body,
      query: req.query,
      cookies: req.cookies,
    };

    await vercelHandler(vercelReq, res);
  };
};

// Use the same handler as Vercel
app.post('/api/certificates', adaptVercelToExpress(certificatesHandler));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

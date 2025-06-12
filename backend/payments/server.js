import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const stripe = Stripe('sk_test_YOUR_SECRET_KEY'); // Replace with your Stripe secret key

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
  });
  res.send({ clientSecret: paymentIntent.client_secret });
});

app.listen(3002, () => console.log('Payments server running on port 3002')); 
const express = require('express');
const { json } = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51Ni5FKKAIrTUOi75c9U1eHhwv5vyMy8jEsWIhkDSTKtOfSGURG8Zz77IBIcP5UxuDcqUZ6GBtn1mM93gvptY1xfJ00PmjNDVqH');
const { v4: uuidv4 } = require('uuid'); // Import uuidv4 for generating idempotency keys

const app = express();

app.use(cors());
app.use(json());

app.get('/', (req, res) => {
  res.send('Welcome to Luxmi!');
});

app.post('/product-checkout', async (req, res) => {
  let error;
  let status;

  try {
    const { cart, token } = req.body;
    const { name, address_line1, address_line2, address_city, address_country, address_zip } = token.card;

    const { selectedPrice, quantity } = cart;

    const totalAmount = selectedPrice * parseInt(quantity.current);
    const amount = Math.floor(totalAmount);

    console.log('selectedPrice:', selectedPrice);
    console.log('selectedQuantity:', parseInt(quantity.current));
    console.log('totalAmount:', totalAmount);
    console.log('amount:', amount);

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const key = uuidv4();
    const charge = await stripe.charges.create(
      {
        amount: amount * 100, // Amount in cents
        currency: cart.localCurrency,
        customer: customer.id,
        receipt_email: token.email,
        description: 'Products descriptions here',
        shipping: {
          name: name,
          address: {
            line1: address_line1,
            line2: address_line2,
            city: address_city,
            country: address_country,
            postal_code: address_zip,
          },
        },
      },
      { idempotencyKey: key }
    );

    status = 'success';
  } catch (error) {
    console.log(error);
    status = 'error';
  }

  res.json({ status });
});

app.post('/service-checkout', async (req, res) => {
  let error;
  let status;

  try {
    const { cart, token } = req.body;
    const { name, address_line1, address_line2, address_city, address_country, address_zip } = token.card;

    const { selectedPrice, quantity } = cart;

    const totalAmount = selectedPrice * parseInt(quantity.current);
    const amount = Math.floor(totalAmount);

    console.log('selectedPrice:', selectedPrice);
    console.log('selectedQuantity:', parseInt(quantity.current));
    console.log('totalAmount:', totalAmount);
    console.log('amount:', amount);

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const key = uuidv4();
    const charge = await stripe.charges.create(
      {
        amount: amount * 100, // Amount in cents
        currency: cart.localCurrency,
        customer: customer.id,
        receipt_email: token.email,
        description: 'Products descriptions here',
        shipping: {
          name: name,
          address: {
            line1: address_line1,
            line2: address_line2,
            city: address_city,
            country: address_country,
            postal_code: address_zip,
          },
        },
      },
      { idempotencyKey: key }
    );

    status = 'success';
  } catch (error) {
    console.log(error);
    status = 'error';
  }

  res.json({ status });
});

app.post('/sterling-checkout', async (req, res) => {
  let error;
  let status;

  try {
    const { cart, token } = req.body;
    const { quantity, currency } = cart;

    const rate = currency === 'USD' ? 1 : 75;
    const amount = quantity * rate;

    console.log('Currency:', currency);
    console.log('Quantity:', quantity);
    console.log('Amount:', amount);

    if (!['USD', 'INR'].includes(currency)) {
      throw new Error('Invalid currency');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Invalid quantity');
    }

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const key = uuidv4();
    const charge = await stripe.charges.create(
      {
        amount: amount * 100, // Amount in cents
        currency: currency,
        customer: customer.id,
        receipt_email: token.email,
        description: 'Sterling Purchase',
      },
      { idempotencyKey: key }
    );

    status = 'success';
  } catch (error) {
    console.log(error);
    status = 'error';
  }
  res.json({ status });
});

app.listen(8080, () => {
  console.log('Your app is running on port no 8080');
});
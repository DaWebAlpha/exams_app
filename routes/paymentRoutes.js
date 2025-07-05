import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';             // ✅ new: to hash password
import { User } from '../models/userModels.js';

dotenv.config();

const router = express.Router();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// User submits signup form → hit this route to init payment
router.post('/pay', async (req, res) => {
  const { username, email, password, confirmPassword, examType } = req.body;

  try {
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: 500 * 100, // 5 cedis
        metadata: {
          username,
          password,
          confirmPassword,
          examType
        },
        callback_url: `${req.protocol}://${req.get('host')}/payment/callback`
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.redirect(paystackRes.data.data.authorization_url);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Payment initialization failed.');
  }
});

// Paystack calls this URL after payment
router.get('/payment/callback', async (req, res) => {
  const reference = req.query.reference;
  console.log("✅ Callback triggered. Reference received:", reference);

  if (!reference) {
    console.log("⚠️ No reference in query!");
    return res.redirect('/register?error=No payment reference returned from Paystack');
  }

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
      }
    );

    console.log("✅ Paystack verify response:", verifyRes.data);

    const data = verifyRes.data.data;
    if (data.status === 'success') {
      console.log("🎉 Payment verified successfully. Proceed to create user.");

      // Extract data from metadata
      const { username, password, confirmPassword, examType } = data.metadata;
      const email = data.customer.email;  // ✅ use email from customer

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("⚠️ User already exists:", email);
        return res.redirect('/register?error=User already exists');
      }

      if (password !== confirmPassword) {
        console.log("⚠️ Password mismatch");
        return res.redirect('/register?error=Passwords do not match');
      }

      // ✅ Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      await User.create({
        username,
        email,
        password: hashedPassword,
        examType
      });

      console.log("✅ User created successfully.");
      res.redirect('/login?success=Registration complete! Please login');
    } else {
      console.log("❌ Payment verification failed on Paystack:", data.status);
      res.redirect('/register?error=Payment failed or incomplete');
    }
  } catch (error) {
    console.error("❌ Verification error:", error.response?.data || error.message);
    res.status(500).send('Payment verification failed.');
  }
});

export default router;

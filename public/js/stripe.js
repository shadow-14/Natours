/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
// import { loadStripe } from '@stripe/stripe-js';
const stripe =  Stripe('pk_test_51PzSDI02AfmbwOlLvIiUpoeK8RiGsKxWyDD1grEMPmzRWdtnl0Fzg735FXVCp4bKxxkX3ru0ZUETfEeijGc6J8eT00dRJFalMc');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
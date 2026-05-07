const axios = require('axios');

const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

/**
 * Initialize a Chapa payment
 * @param {Object} params
 * @param {string} params.amount - Amount in ETB
 * @param {string} params.currency - Currency (default: ETB)
 * @param {string} params.email - Customer email
 * @param {string} params.firstName - Customer first name
 * @param {string} params.lastName - Customer last name
 * @param {string} params.txRef - Unique transaction reference
 * @param {string} params.callbackUrl - Webhook URL for Chapa to call
 * @param {string} params.returnUrl - URL to redirect after payment
 * @param {string} params.title - Payment title
 * @param {string} params.description - Payment description
 */
const initializePayment = async (params) => {
  const payload = {
    amount: String(params.amount),
    currency: params.currency || 'ETB',
    email: params.email,
    first_name: params.firstName,
    last_name: params.lastName,
    tx_ref: params.txRef,
    callback_url: params.callbackUrl,
    return_url: params.returnUrl,
    customization: {
      title: params.title || 'SmartTutorET Payment',
      description: params.description || 'Course enrollment payment',
    },
  };

  const response = await axios.post(`${CHAPA_BASE_URL}/transaction/initialize`, payload, {
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

/**
 * Verify a Chapa transaction
 * @param {string} txRef - Transaction reference to verify
 */
const verifyPayment = async (txRef) => {
  const response = await axios.get(`${CHAPA_BASE_URL}/transaction/verify/${txRef}`, {
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    },
  });

  return response.data;
};

module.exports = { initializePayment, verifyPayment };

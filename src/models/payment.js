const mongoose = require('mongoose');


const Payment = mongoose.model('Payment',{
  preceive: String,
  ppayment: String,
  amount: Number,
  approved: Boolean
});


module.exports = Payment;
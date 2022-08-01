const mongoose = require('mongoose');
const Payment = require('../models/payment');
const {produce} = require("../kafka/produce")

// list
exports.listPayments = async (req, res) => {
  try {
    const data = await Payment.find({});
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send({ e});
  }
};

// create
exports.createPayment = async (req, res) => {
  console.log(req.body.ppayment)
  const {ppayment, preceive, amount, approved } = req.body
  const payment = {
    ppayment,
    preceive,
    amount,
    approved,
  }
  console.log(payment)
  try {
    await Payment.create(payment);
    await produce(payment);
    res.status(201).send({payment});
  } catch (e) {
    res.status(500).send({Error: e});
  }
};
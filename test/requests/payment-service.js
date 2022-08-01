const request = require("supertest")


const paymentCreate = async (body) => {
    let res = await request("http://localhost:3000")
    .post("/payment")
    .send(body);
    return res;
}

module.export = paymentCreate;
  
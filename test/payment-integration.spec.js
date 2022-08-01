const ip = require('ip')
const { Kafka, logLevel, waitFor } = require("kafkajs")
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry')
const { waitForConsumerToJoinGroup,waitForMessages } = require("./utils/testeHelpers")
const { expect } = require("chai");
const paymentCreate = require("./requests/payment-service");
const request = require("supertest");

const host = process.env.HOST_IP || ip.address()

const kafka = new Kafka({
    clientId: 'admin',
    brokers: [`${host}:9092`],
    //logLevel: logLevel.DEBUG
});

const registry = new SchemaRegistry({ host: 'http://localhost:8081' })

let consumer;
let body = { 
    ppayment: `Fulano ${Math.random() * 100}`, 
    preceive: "MTC Conference", 
    amount: Math.random() * 100, 
    approved: false
};
let response;

afterEach(async () => {
    consumer && (await consumer.disconnect())
})

describe("Validate payment service", async () => {
    it("Should return payment registry", async () => {

        let response = await request("http://localhost:3000").post("/payment").send(body);
 
        expect(response.statusCode).to.be.eq(201)
        expect(response.body.payment.ppayment).to.be.eq(body.ppayment)
        expect(response.body.payment.preceive).to.be.eq(body.preceive)
        expect(response.body.payment.amount).to.be.eq(body.amount)
        expect(response.body.payment.approved).to.be.eq(body.approved)
        
    })

    it("Should produce event in topic Payment", async () => {
        const messagesConsumed = [];
        
        consumer = kafka.consumer({ groupId: 'payment-group' })
        await consumer.connect()
        await consumer.subscribe({ topic: 'Payments', fromBeginning: true })
        consumer.run({ eachMessage: async ({message}) => messagesConsumed.push(message.value) })
        await waitForConsumerToJoinGroup(consumer);

        await request("http://localhost:3000").post("/payment").send(body);

        await waitForMessages(messagesConsumed, { number: 1 })
        console.log("\n******* Mensagem consumida ********\n" + messagesConsumed[messagesConsumed.length - 1])

        let messageDecode = await registry.decode(messagesConsumed[messagesConsumed.length - 1])
        messageDecode = JSON.parse(messageDecode)
        console.log("\n******** Mensagem deserializada *********\n" + JSON.stringify(messageDecode))
    
        expect(messageDecode.ppayment).to.be.eq(body.ppayment)
        expect(messageDecode.preceive).to.be.eq(body.preceive)
        expect(messageDecode.amount).to.be.eq(body.amount)
        expect(messageDecode.approved).to.be.eq(body.approved)
        
    })

})
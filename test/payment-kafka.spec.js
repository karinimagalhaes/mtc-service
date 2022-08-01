const ip = require('ip')
const { Kafka, logLevel, waitFor } = require("kafkajs")
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry')
const { waitForConsumerToJoinGroup,waitForMessages } = require("./utils/testeHelpers")
const { produce } = require("../src/kafka/produce")
const { consume } = require("../src/kafka/consume")
const { expect  } = require("chai");

const host = process.env.HOST_IP || ip.address()

const kafka = new Kafka({
    clientId: 'admin',
    brokers: [`${host}:9092`]
});

const registry = new SchemaRegistry({ host: 'http://localhost:8081' })

let consumer;

afterEach(async () => {
    consumer && (await consumer.disconnect())
})

describe("Validate kafka produce", async () => {
    it("should produce the sent event", async () => {

        const messageProduce = { 
            ppayment: "Karini", 
            preceive: "Kafka Enterprise", 
            amount: 90.00, 
            approved: false
        };
        const messagesConsumed = [];

        consumer = kafka.consumer({ groupId: 'payment-group' })
        await consumer.connect()
        await consumer.subscribe({ topic: 'Payments', fromBeginning: true })
        consumer.run({ eachMessage: async ({message}) => messagesConsumed.push(message.value) })
        await waitForConsumerToJoinGroup(consumer)
        
        
        console.log("********* Produzindo a mensagem ***********")
        await produce(messageProduce)

        await waitForMessages(messagesConsumed, { number: 1 })
        console.log("******* Mensagem consumida ********\n" + messagesConsumed[messagesConsumed.length - 1])

        let messageDecode = await registry.decode(messagesConsumed[messagesConsumed.length - 1])
        messageDecode = JSON.parse(messageDecode)
        console.log("******** Mensagem deserializada *********\n" + JSON.stringify(messageDecode))

        expect(messageDecode.ppayment).to.be.eq(messageProduce.ppayment)
        expect(messageDecode.preceive).to.be.eq(messageProduce.preceive)
        expect(messageDecode.amount).to.be.eq(messageProduce.amount)
        expect(messageDecode.approved).to.be.eq(messageProduce.approved)

    })

})


const avro = require('avsc')
const { Kafka, logLevel } = require("kafkajs")
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry')

const kafka = new Kafka({
    clientId: 'admin',
    brokers: ['localhost:9092'],
    logLevel: logLevel.DEBUG
});

// registry schema
 const registry = new SchemaRegistry({ host: 'http://localhost:8081' })

const consume = async () => {
    const consumer = kafka.consumer({ groupId: 'payment-group' })
    await consumer.connect()
    await consumer.subscribe({ topic: 'Payments' })
  
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
             console.log("********* consumindo")
            let messageDecoded = await registry.decode(message.value)
            messageConsumed(messageDecoded)
            //console.log("****** mendagem decodificada" + await registry.decode(message.value));
        }
    })
}

messageConsumed = (message) => {
    console.log("********* message" + message)
}

module.exports = {consume}
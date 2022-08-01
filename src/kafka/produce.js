const ip = require('ip')
const path = require('path')
const { Kafka, logLevel } = require("kafkajs")
const { SchemaRegistry, SchemaType, readAVSCAsync } = require('@kafkajs/confluent-schema-registry')

const host = process.env.HOST_IP || ip.address()
const kafka = new Kafka({
    clientId: 'admin',
    brokers: [`${host}:9092`],
    //logLevel: logLevel.INFO
});

const produce = async (message) => {

    // registry schema
    const registry = new SchemaRegistry({ host: 'http://localhost:8081' })
    // const schema = await readAVSCAsync('/Users/karinimagalhaes/Documents/workspace/service-mtc/src/kafka/avro/payment-schema.avsc');

    const schema = `{
        "namespace": "com.demo.avro",
        "type": "record",
        "name": "Payment",
        "fields": [
            {
                "name": "ppayment",
                "type": "string"
            },
            {
                "name": "preceive",
                "type": "string"
            },
            {
                "name": "amount",
                "type": "double"
            },
            {
                "name": "approved",
                "type": "boolean"
            }
        ]
    }`

    const { id } = await registry.register({ 
        type: SchemaType.AVRO, 
        schema: schema 
    })

    const encodedMessage = await registry.encode(id, message)

    // Producing
    const producer = kafka.producer()
    await producer.connect()
    await producer.send({
      topic: 'Payments',
      messages: [{ value: encodedMessage },],
    })
    console.log("********* Message Produced ****** " + encodedMessage)

    await producer.disconnect()
}

module.exports = {produce}
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI 
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB conectado");
    return client;
  } catch (error) {
    console.error("Error MongoDB:", error);
    process.exit(1);
  }
}

module.exports = { client, connectDB };

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://482200364_db_user:Nex0Test123@nexoconstuye.ck8s886.mongodb.net/?retryWrites=true&w=majority";
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

const express = require('express');
const cors = require('cors')
const { MongoClient } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000
const fileUpload = require("express-fileupload")
require('dotenv').config()

app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clx8w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run() {

    try {

        await client.connect()
        const database = client.db("basha_khuja")
        const postingCollection = database.collection("posting")
        const usersCollection = database.collection("users")

        app.get('/post', async (req, res) => {
            const cursor = postingCollection.find({});
            const posts = await cursor.toArray();
            res.send(posts);

        })

        app.post('/post', async (req, res) => {
            const location = req.body.location
            const price = req.body.price
            const description = req.body.description
            const phone = req.body.phone
            const pic = req.files.image
            const picData = pic.data
            const encodePic = picData.toString("base64")
            const imageBuffer = Buffer.from(encodePic, "base64")
            const post = {
                location,
                price,
                description,
                phone,
                image: imageBuffer
            }
            const result = await postingCollection.insertOne(post)
            console.log(result)
            res.json(result)
        })

        app.get("/user/:email", async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === "admin") {
                isAdmin = true
            }

            res.json({ admin: isAdmin });
        })

        app.post("/user", async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            console.log(result)
            res.json(result)
        })

        app.put("/user", async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const option = { upsert: true }
            const userDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, userDoc, option)
            res.json(result)
            console.log(result)

        })
        app.put("/user/admin", async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: "admin" } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

    }
    finally {

    }

}

run().catch(console.dir)















app.get("/", (req, res) => {
    res.send("Hello this message from server")
})

app.listen(port, () => {
    console.log("server is running on ", port)
})
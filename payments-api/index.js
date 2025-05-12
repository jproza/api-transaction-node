const express = require("express");
const app = express();
const port = 3002;
const morgan = require('morgan')

const axios = require('axios');
const responseTime = require('response-time');
const redis = require('redis');
const { BASE_URL } = process.env;

app.use(responseTime());
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true }));

const redisClient = redis.createClient({ url: "redis://redis:6379" });
redisClient.on('error', err => console.log('Redis Client Error', err));


app.get('/with-redis', async (req, res) => {
  try {
    const getResultRedis = await redisClient.get('rockets');

    if (getResultRedis) {
      console.log('Use cached data');
      return res.json({ data: JSON.parse(getResultRedis) });
    }

    const response = await axios.get('https://api.spacexdata.com/v4/rockets');
    const saveResultRedis = await redisClient.set('rockets', JSON.stringify(response.data))
    console.log('New data cached ', saveResultRedis);
    return res.json({ data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/without-redis', async (req, res) => {
  try {
    const response = await axios.get('https://api.spacexdata.com/v4/rockets');
    return res.json({ data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

  app.post('/data', (req, res) => {
      const requestBody = req.body;

      console.log('Received data:', requestBody);

      // Process the data as needed
      // For example, send a response back to the client
      res.json({ message: 'Data received successfully', data: requestBody });
    });


app.post('/create',  (req, res) => {
 try {

      const saveResultRedis = req.body;
      const date = Math.floor(Date.now() / 1000);
      console.log('Received data:', saveResultRedis);

    const dataJson = JSON.stringify({saveResultRedis})

    const successFailCode =  (redisClient.json.set('payments', '$', saveResultRedis,  'xx'))

    return res.send({
        message: 'payments created successfully',
        data: dataJson
    });
   } catch (error) {
     console.log(error);
     return res.status(500).json({ message: "Internal server error" });
   }
});

app.get('/getAll',  async (req, res) => {
  try {
    const getResultRedis =  await redisClient.json.get('payments');
    if (getResultRedis) {
      console.log('Use cached data');
      return res.send({
                      success: true,
                      message: 'Payments retrieved from cache successfully!',
                      data   : JSON.parse(getResultRedis)
                  });
    }

    // If cached data doesn't exist, fetch data from database and cache it
           // const results = await new Promise((resolve, reject) => {
             //   DB.query('SELECT * FROM payments', (err, results) => {
               //     if (err) reject(err);
                 //   resolve(results);
               // });
           // });


    console.log('lack  cached data');
    if (!getResultRedis) {
                return res.send({
                    success: false,
                    message: 'No payments  found!',
                    data   : getResultRedis
                });
            }
  } catch (error) {
    console.log(error);
    throw error;
  }
});



redisClient.connect().then(() => {
  console.log("Redis connected")
  app.listen(port, () => {
    console.log(` 😀 server on port ${port}  `);
  });
});
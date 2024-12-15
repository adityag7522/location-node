const express = require('express');
require('dotenv').config();
const app = express();


const port = process.env.PORT;

app.use(express.json());

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;


mongoose.connect(mongoURI,{
    family: 4
}).then((data)=>{
    console.log(`mongodb connected with server: ${mongoose.connection.host}`);
});


const Location = mongoose.model('location', {
    longitude: String,
    latitude: String,
    ipAddress: String
});


const twilio = require('twilio');

// Twilio credentials from your Twilio console
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

// Create a Twilio client
const client = twilio(accountSid, authToken);

function sendSMS(msg) {
    client.messages
        .create({
            body: msg,
            from: `${process.env.FROM}`, // Your Twilio phone number
            to:  `${process.env.TO}`  // The recipient's phone number
        })
        .then(message => console.log(`Message sent with SID: ${message.sid}`))
        .catch(error => console.error('Error sending SMS:', error));
}

app.get('/api/v1/aditya/all/location', async (req, res) => {
    // sendSMS();
    try {
        const locations = await Location.find();
        console.log(locations);
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Error fetching locations' });
    }
});

app.post('/saveLocation', async (req, res) => {
    try {
        const { longitude, latitude, ipAddress } = req.body;
        const location = new Location({ longitude, latitude, ipAddress });
        await location.save();
        const message = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}  \n ipAddress = ${ipAddress}`;
        sendSMS(message);
        res.json({ message: 'Location saved successfully' });
    } catch (error) {
        console.error('Error saving location:', error);
        res.status(500).json({ error: 'Error saving location' });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
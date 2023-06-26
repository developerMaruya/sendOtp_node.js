// Import necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const twilio = require('twilio');

// Set up Twilio client with your account SID and auth token
const client = twilio('AC61f2ca4abdee33297c145de5a4b9ebc3', '264319e33bbab9c0e2fe796758432257');

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'em'
});

// Create an express app
const app = express();

// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Generate and send an OTP to the user's phone number
app.post('/send-otp', (req, res) => {
    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP

    // Save the OTP and its expiry date to the database
    const expiryDate = new Date(Date.now() + 5 * 60 * 1000); // Set expiry time to 5 minutes from now
    const sql = 'INSERT INTO otp (phone_number, otp, expiry_date) VALUES (?, ?, ?)';
    pool.query(sql, [phoneNumber, otp, expiryDate], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error saving OTP to database');
            return;
        }

        // Send the OTP to the user's phone number
        client.messages.create({
            body: `Your OTP is ${otp}`,
            from: '+15076046360',
            to: phoneNumber
        })
        .then(() => {
            res.status(200).send('OTP sent successfully');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error sending OTP');
        });
    });
});

// Verify the OTP provided by the user
app.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Check if the OTP is valid and not expired
    const sql = 'SELECT otp, expiry_date FROM otp WHERE phone_number = ? ORDER BY created_at DESC LIMIT 1';
    pool.query(sql, [phoneNumber], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error checking OTP in database');
            return;
        }

        if (results.length === 0) {
            res.status(400).send('OTP not found');
            return;
        }

        const { otp: savedOtp, expiry_date: expiryDate } = results[0];

        if (otp !== savedOtp) {
            res.status(400).send('Invalid OTP');
            return;
        }

        if (expiryDate < new Date()) {
            res.status(400).send('OTP expired');
            return;
        }

        // OTP is valid and not expired
        res.status(200).send('OTP verified successfully');
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

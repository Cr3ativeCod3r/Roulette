const passport = require("passport");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const db = require('../server');
const fetch = require('node-fetch');
const crypto = require('crypto');


router.get("/steam", passport.authenticate("steam", { session: false }));

function generateNonce() 
{
  let nonce = crypto.randomBytes(16).toString('base64');
  return nonce;
}

router.get(
  "/steam/return",
  passport.authenticate("steam", { session: false }),
  (req, res) => {

    const nonce = generateNonce();
    const token = jwt.sign({ user: req.user }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    res.render("authenticated", {
      jwtToken: token,
      clientUrl: process.env.domain,
      nonce: nonce, 
    });
  }
);

















router.get('/api/data', (req, res) => {
  const query = 'SELECT * from bethistory';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych:', err);
      res.status(500).json({ error: 'Błąd serwera' });
    } else {
      res.json(results);
    }
  });
});


router.get('/users', (req, res) => {
  const query = 'SELECT avatar,name,usertyp from users';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych:', err);
      res.status(500).json({ error: 'Błąd serwera' });
    } else {
      res.json(results);
    }
  });
});

router.get('/it', (req, res) => {
  fetch('http://csgobackpack.net/api/GetItemsList/v2/')
    .then(response => {
      if (response.status === 200) {
        return response.text(); // Read the response as text
      } else {
        throw new Error('Failed to fetch data');
      }
    })
    .then(data => {
      try {
        // Attempt to parse the data as JSON
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Failed to parse JSON data' });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    });
});





module.exports = router;

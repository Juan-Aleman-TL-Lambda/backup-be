const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js');

const Users = require('../users/users-model.js');

router.post('/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;
    
    Users.add(user)
        .then(saved => {
            // console.log("USER:", saved)
            const token = genToken(saved);
            res.status(201).json({
            message: "User saved", saved, token: token
            });
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

router.post('/login', (req, res) => {
    let {
        email,
        password
    } = req.body;

    Users.findBy({
            email
        })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                const token = genToken(user);
                res.status(200).json({
                    email: user.email,
                    token: token
                });
            } else {
                res.status(401).json({
                    message: 'Invalid Credentials'
                });
            }
        });
});

router.get('/users', (req, res) => {
    Users.find()
    .then(response => {
      res.status(200).json(response)
    })
    .catch(error => {
      res.status(500).json(error)
    })
  })

function genToken(user) {
    const payload = {
        userid: user.id,
        email: user.email
    };
    const options = {
        expiresIn: '5d'
    };
    const token = jwt.sign(payload, secrets.jwtSecret, options);

    return token;
}

module.exports = router;
const router = require('express').Router();
const bcrypt = require('bcryptjs');

const tokenService = require('../auth/token-service');
const Users = require('../users/users-module.js');

router.post('/register', (req, res) => {
  let user = req.body;
  // generate hash from user's password
  const hash = bcrypt.hashSync(user.password, 5); // 2^n (not the actual number you pass)
  // override user.password with hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // check that passwords match
      if (user && bcrypt.compareSync(password, user.password)) {
        // produce token
        const token = tokenService.generateToken(user);
        res
          .status(200)
          .json({ message: `Welcome ${user.username}!, have a token.`, token });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

module.exports = router;

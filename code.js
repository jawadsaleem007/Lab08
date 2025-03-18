const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let users = [];
let events = [];

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.json({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username }, 'secret');
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ message: 'No token' });
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.username = decoded.username;
        next();
    });
};

app.post('/events', authMiddleware, (req, res) => {
    const event = { ...req.body, username: req.username };
    events.push(event);
    res.json({ message: 'Event created' });
});

app.get('/events', authMiddleware, (req, res) => {
    const userEvents = events.filter(event => event.username === req.username);
    res.json(userEvents);
});

app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = app;

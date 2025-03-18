const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/eventsDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({ username: String, password: String });
const eventSchema = new mongoose.Schema({ name: String, description: String, date: Date, category: String, reminder: Boolean, userId: String });
const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, password: hashedPassword }).save();
    res.json({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, 'secret');
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
        req.userId = decoded.userId;
        next();
    });
};

app.post('/events', authMiddleware, async (req, res) => {
    const event = new Event({ ...req.body, userId: req.userId });
    await event.save();
    res.json({ message: 'Event created' });
});

app.get('/events', authMiddleware, async (req, res) => {
    const events = await Event.find({ userId: req.userId }).sort('date');
    res.json(events);
});

app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = app;

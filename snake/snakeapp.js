const express = require('express');

const app = express();
app.get('/snake', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/snake.html'));
});
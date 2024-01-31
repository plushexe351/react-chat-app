const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

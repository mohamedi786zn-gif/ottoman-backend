const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', ottoman: true });
});

app.post('/api/wallet/connect', (req, res) => {
    res.json({ success: true, address: '0x' + Date.now() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ottoman backend running'));

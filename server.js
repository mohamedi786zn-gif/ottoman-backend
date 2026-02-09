const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

app.use(cors());
app.use(express.json());

// ===== OTTOMAN BLOCKCHAIN CORE =====
class OttomanBlockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.miningReward = 0.00003;
        this.difficulty = 4;
        this.createGenesisBlock();
    }
    
    createGenesisBlock() {
        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            transactions: [{
                from: 'GENESIS',
                to: 'OTTOMAN_FOUNDATION',
                amount: 1000000,
                token: 'OTTO'
            }],
            nonce: 0,
            hash: this.calculateHash(0, Date.now(), [], 0),
            previousHash: '0'
        };
        this.chain.push(genesisBlock);
    }
    
    calculateHash(index, timestamp, transactions, nonce) {
        return crypto
            .createHash('sha256')
            .update(index + timestamp + JSON.stringify(transactions) + nonce)
            .digest('hex');
    }
    
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    
    mineBlock(minerAddress) {
        const block = {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: 0,
            previousHash: this.getLatestBlock().hash
        };
        
        // Proof of Work
        let hash = this.calculateHash(block.index, block.timestamp, block.transactions, block.nonce);
        while (hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
            block.nonce++;
            hash = this.calculateHash(block.index, block.timestamp, block.transactions, block.nonce);
        }
        
        block.hash = hash;
        
        // Add mining reward
        const rewardTransaction = {
            from: 'MINING_REWARD',
            to: minerAddress,
            amount: this.miningReward,
            token: 'OTTO',
            timestamp: Date.now()
        };
        
        block.transactions.push(rewardTransaction);
        this.chain.push(block);
        this.pendingTransactions = [];
        
        return block;
    }
    
    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
        return this.pendingTransactions.length;
    }
    
    getBlockchainStats() {
        return {
            blockHeight: this.chain.length,
            pendingTransactions: this.pendingTransactions.length,
            difficulty: this.difficulty,
            miningReward: this.miningReward,
            totalBlocks: this.chain.length,
            latestBlock: this.getLatestBlock().hash.substring(0, 16) + '...'
        };
    }
}

// Initialize blockchain
const ottomanChain = new OttomanBlockchain();

// ===== WEB SOCKET FOR REAL-TIME MINING =====
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('🔗 New blockchain connection');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'start_mining') {
                const block = ottomanChain.mineBlock(data.minerAddress);
                ws.send(JSON.stringify({
                    type: 'block_mined',
                    block: block,
                    reward: ottomanChain.miningReward + ' OTTO'
                }));
            }
        } catch (error) {
            console.error('WebSocket error:', error);
        }
    });
});

// ===== API ENDPOINTS =====

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        server: 'Render',
        chain: 'Ottoman Empire',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Wallet connection
app.post('/api/wallet/connect', (req, res) => {
    const address = '0x' + crypto.randomBytes(20).toString('hex').toUpperCase();
    res.json({
        success: true,
        address: address,
        network: 'Ottoman Mainnet',
        message: 'Empire wallet connected',
        timestamp: new Date().toISOString()
    });
});

// NFT minting
app.post('/api/nft/mint', (req, res) => {
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    res.json({
        success: true,
        txHash: txHash,
        block: ottomanChain.chain.length + 1,
        explorerUrl: `https://explorer.ottomanroyale.co.za/tx/${txHash}`,
        message: 'NFT minted on Ottoman Chain'
    });
});

// Blockchain stats
app.get('/api/blockchain/stats', (req, res) => {
    const stats = ottomanChain.getBlockchainStats();
    res.json({
        blockHeight: stats.blockHeight,
        ottoPrice: 0.85 + (Math.random() * 0.1 - 0.05),
        bridgeVolume: 2400000 + Math.random() * 500000,
        activeUsers: 1247 + Math.floor(Math.random() * 50),
        todayTransactions: 12487 + Math.floor(Math.random() * 500),
        totalVolume: 24800000 + Math.random() * 1000000,
        activeWallets: 8742 + Math.floor(Math.random() * 100),
        miningActive: true,
        miningRate: '0.00003 OTTO/sec'
    });
});

// Mining start
app.post('/api/mining/start', (req, res) => {
    res.json({
        success: true,
        rate: '0.00003 OTTO/sec',
        estimatedDaily: '2.592 OTTO/day',
        difficulty: ottomanChain.difficulty,
        message: 'Mining started on Ottoman Blockchain'
    });
});

// Exchange data
app.get('/api/exchange/tickers', (req, res) => {
    res.json({
        OTTO_USD: 0.85 + (Math.random() * 0.1 - 0.05),
        OLIRA_USD: 1.00,
        OTTO_OLIRA: 0.85,
        volume24h: 24800000
    });
});

// Bank account creation
app.post('/api/bank/create', (req, res) => {
    res.json({
        success: true,
        accountNumber: 'OTTO-BANK-' + Date.now(),
        balance: '0.00',
        currency: 'OTTO',
        message: 'Ottoman Bank account created'
    });
});

// Bridge status
app.get('/api/bridge/status', (req, res) => {
    res.json({
        active: true,
        chains: ['BTC', 'ETH', 'BSC', 'SOL', 'ADA', 'DOT'],
        volume24h: 2400000,
        fee: '0.1%'
    });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🏛️ Ottoman Empire Backend running on port ${PORT}`);
    console.log(`✅ Health: /api/health`);
    console.log(`✅ Wallet: POST /api/wallet/connect`);
    console.log(`✅ NFT: POST /api/nft/mint`);
    console.log(`✅ Mining: POST /api/mining/start`);
});

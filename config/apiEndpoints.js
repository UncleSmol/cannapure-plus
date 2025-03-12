const express = require('express');
const router = express.Router();
const pool = require('./database');

router.get('/strains', async (req, res) => {
    try {
        const strains = {};
        const tableNames = [
            'medical_strains',
            'normal_strains',
            'greenhouse_strains',
            'indoor_strains',
            'pre_rolled',
            'edibles',
            'extracts_vapes',
            'exotic_tunnel_strains'
        ];

        for (const tableName of tableNames) {
            const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
            strains[tableName] = rows;
        }

        res.json(strains);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Database query failed');
    }
});

module.exports = router;
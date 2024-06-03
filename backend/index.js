import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

app.post('/time-data', (req, res) => {
    const { ip, data } = req.body;

    if (!ip || !data) {
        return res.status(400).send('IP and data are required');
    }

    console.log(data);
    console.log(ip);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, `data/${ip}.json`);

    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).send('Error reading file');
        }

        let jsonData = [];
        if (fileData) {
            try {
                jsonData = JSON.parse(fileData);
            } catch (e) {
                return res.status(500).send('Error parsing JSON');
            }
        }

        jsonData.push(data);

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }

            res.send('Data added successfully');
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

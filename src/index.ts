#!/usr/bin/env node
import { App } from './app';

const express = require('express');
const app = express();
const port = 3000;

app.get('/', function (req: any, res: any) {
    res.send('hello world');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    let app = new App();
    app.init();
})

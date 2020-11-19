#!/usr/bin/env node
import { App } from './app';
import { DomainsRoute } from './routes/domains.route';
import { UsersRoute } from './routes/users.route';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

//Body Parser
const urlencodedParser = bodyParser.urlencoded({
    extended: true
});
app.use(urlencodedParser);
app.use(bodyParser.json());

//Définition des CORS
app.use((req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// User routes
const usersRoute = new UsersRoute(app);
const domainsRoute = new DomainsRoute(app);

app.get('/', function (req: any, res: any) {
    res.send('hello world');
});

//On définit la route Hello
app.get('/hello', (req: any, res: any) => {
    res.json("Hello World")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    let app = new App();
    app.init();
})

process.env.APP_NAME = "index-A";
const log = require('./log');
const express = require ('express');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOSTNAME || 'localhost';
const url = `http://${host}:${port}`;

const newrelic = require ('newrelic');

app.use(express.json());

function getRandom (min=0, max=1){
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* 
Rota padrão, gerando apenas uma mensagem de OK
e realiza o registro no LOG do bunyan logstash
*/
app.get('/',(req, res) => {
    log.info('OK');
    res.send ('OK');
});

/* 
Rota de erro registrando no LOG do bunyan logstash
*/
app.get('/error',(req, res) => {
    log.info('Erro na api')
    res.status(500).send('Erro na api');
});

app.listen(port,() =>{
    console.log (`Aplicação rodando na url => ${url}`)
});
const express = require ('express');
const { default: got } = require('got/dist/source');
const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOSTNAME || 'localhost';
const url = `http://${host}:${port}`;
const CircuitBreaker = require('opossum');

const circuitBreakerOptions = {
    timeout: 5000,
    errorThresholdPercentage: 10,
    resetTimeout: 10000
}

/*
States do CIRCUIT BREAKER

CLOSE (sempre chamada a api)
OPEN (nunca chama a api, mas chama funcao de fallback)
HALF OPEN ( chama a api somente a primeira vez, se der erro OPEN, CLOSE)
*/

const breaker = new CircuitBreaker(requestApi,circuitBreakerOptions);
breaker.on('open',() => console.log ('OPEN - CIRCUIT BREAKER'));
breaker.on('close',() => console.log ('CLOSE - CIRCUIT BREAKER'));
breaker.on('halfOpen',() => console.log ('CLOSE - CIRCUIT BREAKER'));

breaker.fallback(() => console.log('called fallback'));

app.use(express.json());

async function requestApi (maxRetryCount=0){
    const urlApi = 'http://localhost:3000/';

    // Lib Got vai fazer a chamada novamente até a quantidade de vezes do parâmetro
    return got(urlApi,{retry:maxRetryCount});
}

async function requestCB (){
    return breaker.fire();
}

/* 
Rota para execução através de circuitbreaker
*/
app.get('/circuitbreaker', async (req, res) => {

    try {
        await requestCB();
        res.send('OK');
        
    } catch (error) {
        res.status(500).send('Erro na chamada da Api A');
        
    }
});

app.listen(port,() =>{
    console.log (`Aplicação rodando na url => ${url}`)
});
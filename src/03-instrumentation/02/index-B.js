process.env.APP_NAME = "index-B";
const log = require('./log');

const express = require ('express');
const { default: got } = require('got/dist/source');
const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOSTNAME || 'localhost';
const url = `http://${host}:${port}`;
const newrelic = require ('newrelic');

const CircuitBreaker = require('opossum');
const redis = require('redis');
const util = require('util');

const client = redis.createClient({host: '127.0.0.1', port:6379});

const redisSetPrimise = util.promisify(client.set).bind(client);
const redisGetPrimise = util.promisify(client.get).bind(client);
const REDISCACHEKEY = "get-api";

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

/*
Função para buscar do valor do REDIS e caso a chave não exista retorno um fallback padrão
*/
async function requestFallbackRedis(){
    let response = "OK DEFAULT";

    try {
        const responseRedis = await redisGetPrimise(REDISCACHEKEY);

        if (responseRedis) {
            response = JSON.parse(responseRedis);
        }

    } catch (error) {

        console.error ('Erro ao consultar o cache do REDIS')
        
    }

    return response;

}

breaker.fallback(requestFallbackRedis);

/* 
Define a estrutura Json do log do bunyan
*/
app.use((req, res, next) => {
    const { params, body, query, method, url, headers } = req;
    log.info({ 
      req: {
        method,
        url,
        headers: JSON.stringify(headers),
        params: JSON.stringify(params),
        query: JSON.stringify(query),
        body: JSON.stringify(body)
      } 
    });
    next();
  });

async function requestApi (maxRetryCount=0){
    const urlApi = 'http://localhost:3000/';
    
    // Lib Got vai fazer a chamada novamente até a quantidade de vezes do parâmetro
    const { body } = await got(urlApi,{retry:maxRetryCount});

    try {
        
        await redisSetPrimise(REDISCACHEKEY, JSON.stringify(body));
        
    } catch (error) {

        console.error("Erro ao salvar no cache - REDIS");
    }

    return body;
}

async function requestCB (){
    return breaker.fire();
}

/* 
Rota para uso do cache do REDIS
*/
app.get('/cache', async (req, res) => {

    try {
        const response =  await requestCB();
        res.send(response);
        
    } catch (error) {
        res.status(500).send('Erro na chamada da Api A');
        
    }
});

app.listen(port,() =>{
    console.log (`Aplicação rodando na url => ${url}`)
});
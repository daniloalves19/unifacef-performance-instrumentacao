const express = require ('express');
const { default: got } = require('got/dist/source');
const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOSTNAME || 'localhost';
const url = `http://${host}:${port}`;

app.use(express.json());

/* 
função para chamar a rota padrão e incrementar a quantidade de tentativas
*/
async function requestApi (maxRetryCount=1){
    const urlApi = 'http://localhost:3000/';

    // Lib Got vai fazer a chamada novamente até a quantidade de vezes do parâmetro
    return got(urlApi,{retry:maxRetryCount});
}

/* 
Rota para tentar executar novamente até a quantidade máxima de tentativas configuradas
*/
app.get('/retry', async (req, res) => {

    try {
        await requestApi();
        res.send('OK');
        
    } catch (error) {
        res.status(500).send('Erro na chamada da Api A');
        
    }
});

app.listen(port,() =>{
    console.log (`Aplicação rodando na url => ${url}`)
});
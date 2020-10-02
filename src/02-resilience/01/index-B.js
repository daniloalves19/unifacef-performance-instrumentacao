const express = require ('express');
const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOSTNAME || 'localhost';
const url = `http://${host}:${port}`;

app.use(express.json());

/* 
função para chamar a rota padrão e incrementar a quantidade de tentativas
*/

async function requestApi (retryCount=0, maxRetryCount=2){
    const url = 'http://localhost:3000/';

    retryCount++;

    try {

        await requestPromise(url);
        
    } catch (error) {
        if (retryCount <= maxRetryCount){
            return await requestApi(retryCount, maxRetryCount);
        }else{
            throw error;
        }
    }
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
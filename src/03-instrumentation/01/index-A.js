const express = require ('express');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOSTNAME || 'localhost';
const url = `http://${host}:${port}`;
process.env.APP_NAME = "index-A";
const newrelic = require ('newrelic');

app.use(express.json());

function getRandom (min=0, max=1){
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* 
Rota padrão, gerando apenas uma mensagem de OK
*/
app.get('/',(req, res) => {
    res.send ('OK');
});


/* 
Rota para forçar status de erro e captura via newrelic
*/
app.get('/error',(req, res) => {
    res.status(500).send('Erro na api');
});

app.listen(port,() =>{
    console.log (`Aplicação rodando na url => ${url}`)
});
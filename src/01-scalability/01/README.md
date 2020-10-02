# Exemplo do uso de escalabilidade com Nginx Load Balance + Docker

## Passo 01 - Criação da Imagem da Aplicação usando Dockerfile
* Faça o build da aplicação através do comando
```
docker build -f <docker file path + docker file name> -t scalability/node-web-app .
```

## Passo 02 - Rode a aplicação 
* Criar duas aplicações, através do comando abaixo
```
docker run -p 3001:3000 -d scalability/node-web-app

docker run -p 3002:3000 -d scalability/node-web-app
```
* Validar as duas rotas
```
curl http://localhost:3001

curl http://localhost:3002
```
* Executar aplicação 2

## Passo 03 - Criação da imagem nginx
* Pegar o IP do docker na máquina (normalmente com o nome "docker0")
```
ifconfig
```
* Outra forma de pegar o IP do docker é através da propriedade gateway
* Anote o ID do Container
```
docker container ls
```
* Anote o IP do Docker
```
docker inspect -f '{{range .NetworkSettings.Networks}}{{.Gateway}}{{end}}' ID do Container
```
* Criar o nginx conf apontando para as 2 aplicações
* Criar Dockerfile para substituir o nginx.conf
* Criar imagem local
```
docker build -f <docker file path + docker file name> -t scalability/nginxloadbalance .
```
* Executar nginx
```
docker run -p 3000:80 -d scalability/nginxloadbalance
```
* Validar se a api ta respondendo na porta 3000
```
curl http://localhost:3000
```
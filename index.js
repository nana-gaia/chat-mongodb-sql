/* 
    Import dos pacotes: 
        - express
        - ejs
        - http
        - path
        - socket.io

*/
const express = require('express');
const ejs = require('ejs');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

/*
    Instancias:
        - express
        - server
        - socket.io
*/
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

/*
    Define a localização da pasta estática:
*/
app.use(express.static(path.join(__dirname, 'public')));


/*
    Define o EJS como a engine de rendereização frontend:
*/
app.set('views', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile);

/*
    Rota raiz '/' para acessar o index.html da aplicação:
*/
app.use('/', (req, res)=>{
    res.render('index.html');
});

/*Conexão com o MongoDB: */
function connectDB() {

    /* URL de conexão com o Atlas mongoDB: */
    let dbUrl = 'mongodb+srv://geovannacarol2003:EQnVhaEXZWLbo6kc@cluster0.7ixr5.mongodb.net/';

    mongoose.connect(dbUrl); //monstra onde conectar
    mongoose.connection.on('error', console.error.bind(console, 'connection error:')); //pede pra conectar
    mongoose.connection.once('open', function callback(){
        console.log("Atlas mongoDB conectado!");
    });

}
/* Chama a função de conexão com o banco de dados */
connectDB();

/* Define o model */
let Message = mongoose.model('Message',{ usuario : String, data_hora : String, message : String});

/* INICIO DO CÓDIGO DO CHAT */

/* Array que armazena as as mensagens */
let messages = [];

/*Recupera as mensagens do banco de dados: */
Message.find({})
    .then(docs=>{
        console.log('DOCS: ' + docs);
        messages = docs;
        console.log('MESSAGES: ' + messages);
    }).catch(err=>{
        console.log(err);
    });

/* Cria a conexão com socket.io */
/* Cria uma conexão com o socketIO que será usada pela aplicação de chat: */
io.on('connection', socket=>{

    /* Exibe a título de teste da conexão o id do socket do usuário conectado: */
    console.log(`Novo usuário conectado ${socket.id}`);

    /* Recupera e mantem as mensagens do front para back e vice-versa: */
    socket.emit('previousMessage', messages);

    /* Dispara ações quando recebe mensagens do frontend: */
    socket.on('sendMessage', data => {

    /* Adicona uma mensagem enviada no final do array de mensagens: */
    // messages.push(data);
    let message = new Message(data);
    message.save()
        .then(
            socket.broadcast.emit('receivedMessage', data)
        )
        .catch(err=>{
            console.log('ERRO: ' + err);
        });

    /* Propaga a mensagem enviada para todos os usuário conectados na aplicaçao de chat: */
    // socket.broadcast.emit('receivedMessage', data);

    });

})



/* FIM DO CÓDIGO DO CHAT */

/*
    Criação servidor http:
*/
server.listen(3000, ()=>{
    console.log('Servidor do web chat rodando em -> http://localhost:3000');
});
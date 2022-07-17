const express = require('express')
const listarCategoria = require('./controllers/categorias')
const loginUsuario = require('./controllers/login')
const { listarTransacoes, cadastrarTransacao, detalharTransacao, atualizarTransacao, deletarTransacao, obterExtrato, filtroTransacao } = require('./controllers/transacoes')
const { cadastroUsuario, detalharUsuario, atualizarUsuario } = require('./controllers/usuarios')
const verificarToken = require('./filtro/verificarToken')

const rotas = express()

rotas.post('/usuario', cadastroUsuario)
rotas.post('/login', loginUsuario)


rotas.get('/usuario', verificarToken, detalharUsuario)
rotas.put('/usuario', verificarToken, atualizarUsuario)

rotas.get('/categoria', verificarToken, listarCategoria)

rotas.get('/transacao', verificarToken, listarTransacoes)
rotas.post('/transacao', verificarToken, cadastrarTransacao)
rotas.get('/transacao/extrato', verificarToken, obterExtrato)
rotas.get('/transacao/:id', verificarToken, detalharTransacao)
rotas.put('/transacao/:id', verificarToken, atualizarTransacao)
rotas.delete('/transacao/:id', verificarToken, deletarTransacao)


module.exports = rotas

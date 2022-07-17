const conexao = require('../conexao');
const secreto = require('../secreto')
const jwt = require('jsonwebtoken')

const verificarToken = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(404).json('Para acessar este recurso um token de autenticação válido deve ser enviado.');

    }
    try {
        const token = authorization.replace('Bearer', '').trim();

        const { id } = jwt.verify(token, secreto);
        const query = 'SELECT * FROM usuarios WHERE id = $1'
        const usuarioEncontrado = await conexao.query(query, [id]);

        if (usuarioEncontrado.rowCount === 0) {
            return res.status(404).json('O usuario não foi encontrado.');

        }
        const { senha, ...usuario } = usuarioEncontrado.rows[0]

        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = verificarToken;
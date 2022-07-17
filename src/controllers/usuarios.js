const conexao = require('../conexao');
const securePassword = require('secure-password');

const pwd = securePassword();


const cadastroUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json('Os campos nome, email e senha são obrigatório')
    }

    try {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const usuarioEncontrado = await conexao.query(query, [email]);
        if (usuarioEncontrado.rowCount > 0) {
            return res.status(400).json({"mensagem": "Usuário já está cadastrado"})
        }


    } catch (error) {
        return res.status(500).json(error.message)
    }

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex')
        const query = 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)'

        const registrandoUsuario = await conexao.query(query, [nome, email, hash]);

        if (registrandoUsuario.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastrar o usuário')
        }

    } catch (error) {
        return res.status(500).json(error.message)
    }

    try {
        const query = 'SELECT id, nome, email FROM usuarios WHERE email = $1';
        const usuarioEncontrado = await conexao.query(query, [email]);
        
        const usuario = usuarioEncontrado.rows[0]

        return res.status(201).json(usuario)
    } catch (error) {
        return res.status(500).json(error.message)
    }
}


const detalharUsuario = (req, res) => {
    const { usuario } = req;

    if (!usuario) {
        return res.status(404).json('Usuario não existe.')
    }

    res.status(200).json(usuario);
}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { usuario } = req;

    if (!nome, !email, !senha) {
        return res.status(404).json({'mensagem':'O campo nome, e-mail e senha são obrigatórios.'});
    }

    try {
        const query = 'SELECT * FROM usuarios WHERE id = $1'
        const usuarioEncontrado = await conexao.query(query, [usuario.id]);

        if (usuarioEncontrado.rowCount === 0) {
            return res.status(404).json({'mensagem':'Usuário não foi encontrado'})
        }

        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex')
        const queryUpdate = 'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4'

        const atualizandoUsuario = await conexao.query(queryUpdate, [nome, email, hash, usuario.id]);

        if (atualizandoUsuario.rowCount === 0) {
            return res.status(400).json({'mensagem': 'Não foi possivel atualizar o usuário'})
        }

        res.status(200).json();

    } catch (error) {
        return res.status(400).json(error.message)
    }

}


module.exports = {
    cadastroUsuario,
    detalharUsuario,
    atualizarUsuario
}
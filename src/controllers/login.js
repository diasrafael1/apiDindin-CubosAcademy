const conexao = require('../conexao');
const securePassword = require('secure-password');
const secreto = require('../secreto')
const jwt = require('jsonwebtoken')

const pwd = securePassword();

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({'mensagem':'Informe e-mail e a senha'})
    }

    try {
        const query = 'SELECT * FROM usuarios WHERE email = $1'
        const verificarEmail = await conexao.query(query, [email])

        if (verificarEmail.rowCount === 0) {
            return res.status(400).json({'mensagem':'Usuario não encontrado.'})
        }

        const usuarioEncontrado = verificarEmail.rows[0];

        const verificarSenha = await pwd.verify(Buffer.from(senha), Buffer.from(usuarioEncontrado.senha, 'hex'))

        switch (verificarSenha) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json({'mensagem':'E-mail/senha incorretos.'});
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
                    const query = 'UPDATE usuarios SET senha = $1 WHERE email = $2'

                    await conexao.query(query, [hash, email])
                } catch {
                    break
                }
        }

        const token = jwt.sign({
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            email: usuarioEncontrado.email
        }, secreto, { expiresIn: "1h" });

        const { senha: senhaUsuario, ...dadosUsuario } = usuarioEncontrado;

        res.status(200).json({ usuario: dadosUsuario, token })
    } catch (error) {
        return res.status(500).json(error.message)
    }

}

module.exports = loginUsuario;
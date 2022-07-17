const conexao = require('../conexao');

const listarCategoria = async (req, res) => {
    try {
        const categorias = await conexao.query('SELECT * FROM categorias');

        return res.status(200).json(categorias.rows)

    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = listarCategoria
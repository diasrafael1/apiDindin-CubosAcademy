const conexao = require('../conexao');

const listarTransacoes = async (req, res) => {
    const { usuario } = req
    const { filtro } = req.query;

    try {
        if (typeof filtro === "string") {
            const queryBusca = 'SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes as t LEFT JOIN categorias as c on t.categoria_id = c.id WHERE (c.descricao ILIKE $1) AND t.usuario_id = $2'
            const busca = await conexao.query(queryBusca, [filtro, usuario.id])
            return res.json(busca.rows[0])
        }

        const resultado = filtro.join("') OR t.usuario_id = $1 AND (c.descricao ILIKE '")
        const queryBusca2 = `SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes as t LEFT JOIN categorias as c on t.categoria_id = c.id WHERE t.usuario_id = $1 AND (c.descricao ILIKE '${resultado}')`
        const busca2 = await conexao.query(queryBusca2, [usuario.id])
        const filtroCategoria = busca2.rows
        return res.json(filtroCategoria)

    }
    catch {

    }

    try {

        const query = 'SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes as t LEFT JOIN categorias as c on t.categoria_id = c.id WHERE t.usuario_id = $1'
        const listaCompleta = await conexao.query(query, [usuario.id])

        return res.json(listaCompleta.rows)



    } catch (error) {
        return res.status(400).json(error.message)
    }

}


const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body
    const { usuario } = req

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(404).json('Os campos são obrigatórios')
    }
    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(404).json('Só é permitido tipo de entrada ou saída')
    }

    try {

        const query = 'INSERT INTO transacoes (tipo, descricao, valor, data, categoria_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6)'
        const transacaoCadastrada = await conexao.query(query, [tipo, descricao, valor, data, categoria_id, usuario.id])

        if (transacaoCadastrada.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastrar a transação.')
        }

    } catch (error) {
        return res.status(400).json(error.message)
    }

    try {
        const querySelect = 'SELECT id FROM transacoes WHERE usuario_id = $1 and valor = $2 and descricao = $3 and categoria_id = $4 and tipo = $5 and data = $6 ';
        const transacaoSelecionada = await conexao.query(querySelect, [usuario.id, valor, descricao, categoria_id, tipo, data])

        const queryCategoryName = 'SELECT descricao FROM categorias WHERE id = $1'
        const nameCategory = await conexao.query(queryCategoryName, [categoria_id])

        return res.status(201).json({
            "id": transacaoSelecionada.rows[0].id,
            tipo,
            descricao,
            valor,
            data,
            "usuario_id": usuario.id,
            categoria_id,
            "categoria_nome": nameCategory.rows[0].descricao
        })

    } catch (error) {
        res.status(400).json(error.message)
    }

}


const detalharTransacao = async (req, res) => {
    const { id } = req.params
    const { usuario } = req

    try {
        const query = 'SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes as t LEFT JOIN categorias as c on t.categoria_id = c.id WHERE t.id = $1'
        const transacao = await conexao.query(query, [id]);

        if (transacao.rowCount === 0) {
            return res.status(404).json({ "mensagem": "Transação não encontrada." })
        }

        if (Number(transacao.rows[0].usuario_id) !== usuario.id) {
            return res.status(404).json({ "mensagem": "Essa transação não pertence ao usuário." })
        }

        return res.status(200).json({ ...transacao.rows[0], "usuario_id": usuario.id })
    } catch (error) {
        return res.status(400).json(error.message)
    }
}


const atualizarTransacao = async (req, res) => {
    const { id } = req.params
    const { usuario } = req
    const { descricao, valor, data, categoria_id, tipo } = req.body

    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(404).json('Só é permitido tipo de entrada ou saída')
    }

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(404).json('Todos os campos são obrigatórios')
    }

    try {
        const query = 'SELECT * FROM transacoes WHERE id = $1 and usuario_id = $2'
        const verificarSeTransacaoPertence = await conexao.query(query, [id, usuario.id]);

        if (verificarSeTransacaoPertence.rowCount === 0) {
            return res.status(404).json('Essa transação não pertence a esse usuário!')
        }

    } catch (error) {
        return res.status(400).json(error.message)
    }

    try {
        const query = 'UPDATE transacoes SET tipo = $1, descricao = $2, valor = $3, data = $4, categoria_id = $5 WHERE id = $6'
        const transacaoAtualizada = await conexao.query(query, [tipo, descricao, valor, data, categoria_id, id]);

        res.status(204).json()
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const deletarTransacao = async (req, res) => {
    const { id } = req.params
    const { usuario } = req

    try {
        const query = 'SELECT * FROM transacoes WHERE id = $1 and usuario_id = $2'
        const verificarSeTransacaoPertence = await conexao.query(query, [id, usuario.id]);

        if (verificarSeTransacaoPertence.rowCount === 0) {
            return res.status(404).json('Essa transação não pertence a esse usuário!')
        }

    } catch (error) {
        return res.status(400).json(error.message)
    }

    try {
        const query = 'DELETE FROM transacoes WHERE id = $1'
        const transacaoAtualizada = await conexao.query(query, [id]);

        if (transacaoAtualizada.rowCount === 0) {
            return res.status(404).json('Transação não encontrada.')
        }

        res.status(204).json()
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const obterExtrato = async (req, res) => {
    const { usuario } = req

    try {
        const query = 'SELECT tipo , valor FROM transacoes WHERE usuario_id = $1'
        const extrato = await conexao.query(query, [usuario.id]);

        let entrada = 0
        let saida = 0

        for (row of extrato.rows) {
            if (row.tipo === "saida") {
                saida += row.valor
            } else {
                entrada += row.valor
            }
        }



        return res.status(200).json({
            entrada,
            saida
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}


module.exports = {
    listarTransacoes,
    cadastrarTransacao,
    detalharTransacao,
    atualizarTransacao,
    deletarTransacao,
    obterExtrato
}
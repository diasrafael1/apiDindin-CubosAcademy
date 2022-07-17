CREATE DATABASE dindin

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    descricao TEXT
);

INSERT INTO categorias (descricao) 
VALUES
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');




CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor INTEGER NOT NULL,
    data TIMESTAMP NOT NULL,
    categoria_id INT NOT NULL REFERENCES categorias(id),
    usuario_id INT NOT NULL REFERENCES usuarios(id)
);

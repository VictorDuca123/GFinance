-- GFinance (SGF) - Migração V1: schema inicial
-- NÃO edite este arquivo depois de aplicado: novas mudanças vão em V2__..., V3__...

CREATE TABLE responsavel (
                             id_responsavel BIGINT       NOT NULL AUTO_INCREMENT,
                             nome           VARCHAR(100) NOT NULL,
                             ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
                             pin_hash       VARCHAR(255) NULL COMMENT 'PIN individual opcional (RNF09), sempre em hash',
                             CONSTRAINT pk_responsavel PRIMARY KEY (id_responsavel),
                             CONSTRAINT uk_responsavel_nome UNIQUE (nome),
                             CONSTRAINT chk_responsavel_nome CHECK (TRIM(nome) <> '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Os 3 usuários do tablet';

CREATE TABLE cliente (
                         id_cliente         BIGINT        NOT NULL AUTO_INCREMENT,
                         nome               VARCHAR(150)  NOT NULL,
                         outras_informacoes VARCHAR(255)  NULL,
                         total_a_receber    DECIMAL(12,2) NOT NULL DEFAULT 0.00
                             COMMENT 'Regra de cobrança a definir pela equipe (RF02)',
                         data_hora_registro DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         id_responsavel     BIGINT        NOT NULL COMMENT 'Responsável pela última inclusão/edição',
                         CONSTRAINT pk_cliente PRIMARY KEY (id_cliente),
                         CONSTRAINT fk_cliente_responsavel FOREIGN KEY (id_responsavel)
                             REFERENCES responsavel (id_responsavel) ON DELETE RESTRICT ON UPDATE CASCADE,
                         CONSTRAINT chk_cliente_nome CHECK (TRIM(nome) <> ''),
                         CONSTRAINT chk_cliente_total_a_receber CHECK (total_a_receber >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE fornecedor (
                            id_fornecedor      BIGINT       NOT NULL AUTO_INCREMENT,
                            nome               VARCHAR(150) NOT NULL,
                            outras_informacoes VARCHAR(255) NULL,
                            data_hora_registro DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            id_responsavel     BIGINT       NOT NULL COMMENT 'Responsável pela última inclusão/edição',
                            CONSTRAINT pk_fornecedor PRIMARY KEY (id_fornecedor),
                            CONSTRAINT fk_fornecedor_responsavel FOREIGN KEY (id_responsavel)
                                REFERENCES responsavel (id_responsavel) ON DELETE RESTRICT ON UPDATE CASCADE,
                            CONSTRAINT chk_fornecedor_nome CHECK (TRIM(nome) <> '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recebimento (
                             id_recebimento         BIGINT        NOT NULL AUTO_INCREMENT,
                             id_cliente             BIGINT        NOT NULL,
                             valor                  DECIMAL(12,2) NOT NULL,
                             data_recebimento       DATE          NOT NULL,
                             informacoes_adicionais VARCHAR(255)  NULL,
                             data_hora_registro     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             id_responsavel         BIGINT        NOT NULL,
                             CONSTRAINT pk_recebimento PRIMARY KEY (id_recebimento),
                             CONSTRAINT fk_recebimento_cliente FOREIGN KEY (id_cliente)
                                 REFERENCES cliente (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
                             CONSTRAINT fk_recebimento_responsavel FOREIGN KEY (id_responsavel)
                                 REFERENCES responsavel (id_responsavel) ON DELETE RESTRICT ON UPDATE CASCADE,
                             CONSTRAINT chk_recebimento_valor CHECK (valor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE saida (
                       id_saida           BIGINT        NOT NULL AUTO_INCREMENT,
                       descricao          VARCHAR(255)  NOT NULL,
                       valor              DECIMAL(12,2) NOT NULL,
                       data_saida         DATE          NOT NULL,
                       data_hora_registro DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       id_responsavel     BIGINT        NOT NULL,
                       id_fornecedor      BIGINT        NULL,
                       CONSTRAINT pk_saida PRIMARY KEY (id_saida),
                       CONSTRAINT fk_saida_responsavel FOREIGN KEY (id_responsavel)
                           REFERENCES responsavel (id_responsavel) ON DELETE RESTRICT ON UPDATE CASCADE,
                       CONSTRAINT fk_saida_fornecedor FOREIGN KEY (id_fornecedor)
                           REFERENCES fornecedor (id_fornecedor) ON DELETE RESTRICT ON UPDATE CASCADE,
                       CONSTRAINT chk_saida_descricao CHECK (TRIM(descricao) <> ''),
                       CONSTRAINT chk_saida_valor CHECK (valor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE historico (
                           id_historico   BIGINT NOT NULL AUTO_INCREMENT,
                           id_responsavel BIGINT NOT NULL,
                           acao           ENUM('INCLUSAO','EDICAO') NOT NULL,
                           tipo_registro  ENUM('CLIENTE','FORNECEDOR','RECEBIMENTO','SAIDA') NOT NULL,
                           id_registro    BIGINT NOT NULL,
                           data_hora      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           CONSTRAINT pk_historico PRIMARY KEY (id_historico),
                           CONSTRAINT fk_historico_responsavel FOREIGN KEY (id_responsavel)
                               REFERENCES responsavel (id_responsavel) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_cliente_nome         ON cliente (nome);
CREATE INDEX idx_fornecedor_nome      ON fornecedor (nome);
CREATE INDEX idx_recebimento_cli_data ON recebimento (id_cliente, data_recebimento);
CREATE INDEX idx_recebimento_data     ON recebimento (data_recebimento);
CREATE INDEX idx_saida_data           ON saida (data_saida);
CREATE INDEX idx_historico_data_hora  ON historico (data_hora);
CREATE INDEX idx_historico_registro   ON historico (tipo_registro, id_registro);

DELIMITER $$

CREATE FUNCTION fn_responsavel_ativo(p_id BIGINT)
    RETURNS BOOLEAN
    READS SQL DATA
BEGIN
RETURN EXISTS (
    SELECT 1 FROM responsavel
    WHERE id_responsavel = p_id AND ativo = TRUE
);
END$$

CREATE TRIGGER trg_cliente_ai AFTER INSERT ON cliente FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'INCLUSAO', 'CLIENTE', NEW.id_cliente, NOW());
END$$

CREATE TRIGGER trg_cliente_au AFTER UPDATE ON cliente FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'EDICAO', 'CLIENTE', NEW.id_cliente, NOW());
END$$

CREATE TRIGGER trg_fornecedor_ai AFTER INSERT ON fornecedor FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'INCLUSAO', 'FORNECEDOR', NEW.id_fornecedor, NOW());
END$$

CREATE TRIGGER trg_fornecedor_au AFTER UPDATE ON fornecedor FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'EDICAO', 'FORNECEDOR', NEW.id_fornecedor, NOW());
END$$

CREATE TRIGGER trg_recebimento_ai AFTER INSERT ON recebimento FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'INCLUSAO', 'RECEBIMENTO', NEW.id_recebimento, NOW());
END$$

CREATE TRIGGER trg_recebimento_au AFTER UPDATE ON recebimento FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'EDICAO', 'RECEBIMENTO', NEW.id_recebimento, NOW());
END$$

CREATE TRIGGER trg_saida_ai AFTER INSERT ON saida FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'INCLUSAO', 'SAIDA', NEW.id_saida, NOW());
END$$

CREATE TRIGGER trg_saida_au AFTER UPDATE ON saida FOR EACH ROW
BEGIN
    IF NOT fn_responsavel_ativo(NEW.id_responsavel) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável inexistente ou inativo.';
END IF;
INSERT INTO historico (id_responsavel, acao, tipo_registro, id_registro, data_hora)
VALUES (NEW.id_responsavel, 'EDICAO', 'SAIDA', NEW.id_saida, NOW());
END$$

CREATE PROCEDURE sp_listar_clientes(
    IN p_busca VARCHAR(150),
    IN p_somente_pendentes BOOLEAN
)
BEGIN
SELECT id_cliente, nome, total_a_receber, total_recebido, valor_pendente
FROM vw_cliente_pendente
WHERE (p_busca IS NULL OR p_busca = '' OR nome LIKE CONCAT('%', p_busca, '%'))
  AND (p_somente_pendentes IS NULL OR p_somente_pendentes = FALSE OR valor_pendente > 0)
ORDER BY nome;
END$$

CREATE PROCEDURE sp_relatorio_periodo(
    IN p_data_inicio DATE,
    IN p_data_fim DATE
)
BEGIN
    IF p_data_inicio IS NULL OR p_data_fim IS NULL OR p_data_fim < p_data_inicio THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Período inválido: a data final não pode ser anterior à inicial.';
END IF;

SELECT t.data_inicio,
       t.data_fim,
       t.total_recebimentos,
       t.total_saidas,
       (t.total_recebimentos - t.total_saidas) AS resultado
FROM (
         SELECT p_data_inicio AS data_inicio,
                p_data_fim    AS data_fim,
                (SELECT COALESCE(SUM(valor), 0) FROM recebimento
                 WHERE data_recebimento BETWEEN p_data_inicio AND p_data_fim) AS total_recebimentos,
                (SELECT COALESCE(SUM(valor), 0) FROM saida
                 WHERE data_saida BETWEEN p_data_inicio AND p_data_fim)       AS total_saidas
     ) t;
END$$

DELIMITER ;

CREATE VIEW vw_cliente_pendente AS
SELECT c.id_cliente,
       c.nome,
       c.total_a_receber,
       COALESCE(SUM(r.valor), 0) AS total_recebido,
       GREATEST(c.total_a_receber - COALESCE(SUM(r.valor), 0), 0) AS valor_pendente
FROM cliente c
         LEFT JOIN recebimento r ON r.id_cliente = c.id_cliente
GROUP BY c.id_cliente, c.nome, c.total_a_receber;

CREATE VIEW vw_total_geral_pendente AS
SELECT COALESCE(SUM(valor_pendente), 0) AS total_geral_pendente
FROM vw_cliente_pendente;

CREATE VIEW vw_historico_detalhado AS
SELECT h.id_historico,
       r.nome AS nome_responsavel,
       h.acao,
       h.tipo_registro,
       h.id_registro,
       h.data_hora
FROM historico h
         JOIN responsavel r ON r.id_responsavel = h.id_responsavel;

INSERT INTO responsavel (nome, ativo) VALUES
                                          ('Responsável 1', TRUE),
                                          ('Responsável 2', TRUE),
                                          ('Responsável 3', TRUE);
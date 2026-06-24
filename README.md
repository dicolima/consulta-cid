# Teste CID-10

Mini-projeto para testar importação e consulta de CID-10 fora do sistema principal.

## 1. Instalar dependências

```bash
cd teste-cid
npm install
```

## 2. Configurar ambiente

Copie `.env.example` para `.env` e ajuste usuário/senha do PostgreSQL.

```bash
copy .env.example .env
```

No PostgreSQL, crie o banco:

```sql
CREATE DATABASE teste_cid;
```

## 3. Criar tabela

```bash
npm run db:create
```

## 4. Rodar servidor

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

## 5. Importar CSV

Na página inicial, selecione o arquivo CSV do DATASUS e escolha o tipo:

- categoria
- subcategoria
- capitulo
- grupo

Depois pesquise por código ou descrição.

Também é possível colocar arquivos em `src/uploads/cid10` e rodar:

```bash
npm run import:cid
```

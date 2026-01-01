# Fantasy World MMO Server

para gerar/atualizar arquivos de tipagem na pasta "shared" do client, use o comando `npm run build:shared`.

## Valkey (Redis)

- O projeto usa Valkey (compatível com Redis) para manter sessões e membros de instâncias de mapa.
- Serviço já definido em `compose.yaml` como `valkey:6379`.

### Variáveis de ambiente

- `VALKEY_HOST` (default: `127.0.0.1`)
- `VALKEY_PORT` (default: `6379`)
- `VALKEY_PASSWORD` (opcional)
- `VALKEY_DB` (default: `0`)

### Scripts úteis

- Subir serviços: `npm run services:up`
- Teste rápido do Valkey: `npm run valkey:test`

### Onde está a integração

- Conexão e chaves: [src/core/datasources/valkey.datasource.ts](src/core/datasources/valkey.datasource.ts)
- Uso no websocket: [src/websocket/message-handler.ts](src/websocket/message-handler.ts)

### Operações de dados (exemplos)

- Sessão por `sid`: `HSET ws:session:<sid> { client_id, user_id, username }` e `HGETALL ws:session:<sid>`
- Clientes logados: `SADD/SMEMBERS ws:clients`
- Clientes por instância: `SADD/SREM/SMEMBERS ws:instance:<path>:clients`
- Instância atual do cliente: `SET/GET ws:client:<id>:instance`

# Fantasy World MMO Server

para gerar/atualizar arquivos de tipagem na pasta "shared" do client, use o comando `npm run build:shared`.

## Redis

- O projeto usa Redis para manter sessões e membros de instâncias de mapa.
- Serviço definido em `compose.yaml` como `redis_game:6379`.

### Variáveis de ambiente

- `REDIS_HOST` (default: `127.0.0.1`)
- `REDIS_PORT` (default: `6379`)
- `REDIS_USERNAME` (opcional)
- `REDIS_PASSWORD` (opcional)
- `REDIS_DB` (default: `0`)

### Scripts úteis

- Subir serviços: `npm run services:up`
- Teste rápido do Redis: `npm run redis:test`

### Onde está a integração

- Injeção de cliente e chaves: [src/core/services/redis.service.ts](src/core/services/redis.service.ts)
- Uso no websocket: [src/modules/app.gateway.ts](src/modules/app.gateway.ts)
- Uso em módulos: [src/modules/auth/auth.service.ts](src/modules/auth/auth.service.ts), [src/modules/instance/instance.service.ts](src/modules/instance/instance.service.ts)

### Operações de dados (exemplos)

- Sessão por `sid`: `HSET ws:session:<sid> { client_id, user_id, username }` e `HGETALL ws:session:<sid>`
- Clientes logados: `SADD/SMEMBERS ws:clients`
- Clientes por instância: `SADD/SREM/SMEMBERS ws:instance:<path>:clients`
- Instância atual do cliente: `SET/GET ws:client:<id>:instance`

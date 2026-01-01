import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import type { Redis } from 'ioredis';

@Injectable()
export class RedisService {
	constructor(@InjectRedis() private readonly redis: Redis) {}

	private makeKey(parts: string[]): string {
		return parts.join(':');
	}

	public readonly keys = {
		session: (sid: string) => this.makeKey(['ws', 'session', sid]),
		clientSet: this.makeKey(['ws', 'clients']),
		instanceClients: (path: string) => this.makeKey(['ws', 'instance', path, 'clients']),
		clientCurrentInstance: (clientId: string) => this.makeKey(['ws', 'client', clientId, 'instance']),
	};

	public get client(): Redis {
		return this.redis;
	}
}


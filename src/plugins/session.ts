import { FastifyReply, SessionData } from 'fastify';
import fp from 'fastify-plugin';
import * as jwt from 'jsonwebtoken';
import tokenService from '~/lib/services/token-service';

declare module 'fastify' {
	export interface FastifyRequest {
		session?: SessionData;
	}
	export interface FastifyReply {
		setSession: (
			session: SessionData,
			options?: jwt.SignOptions
		) => FastifyReply;
	}
	export interface SessionData {
		user: {
			_id: string;
		};
	}
}

export default fp(async (fastify, opts) => {
	fastify.addHook('onRequest', async (request, reply) => {
		if (!request.cookies['session_token']) {
			return;
		}

		const [error, decoded] = await tokenService.verify(
			request.cookies['session_token']
		);
		if (error) {
			reply.clearCookie('session_token');
		} else {
			request.session = decoded as SessionData;
		}
	});

	fastify.decorateRequest('session', null);
	fastify.decorateReply(
		'setSession',
		async function (
			this: FastifyReply,
			data: SessionData,
			options?: jwt.SignOptions
		) {
			const [error, encoded] = await tokenService.sign(data, options);
			if (!error) {
				this.setCookie('session_token', encoded);
			}
			return this;
		}
	);
});
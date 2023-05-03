import { FastifyReply, SessionData } from 'fastify';
import fp from 'fastify-plugin';
import * as jwt from 'jsonwebtoken';
import { TokenService } from '~/lib/services/token-service';

declare module 'fastify' {
	export interface FastifyRequest {
		session?: SessionData;
	}
	export interface FastifyReply {
		setSession: (session: SessionData, options?: jwt.SignOptions) => void;
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

		const [error, decoded] = await TokenService.instance.verify(
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
			const [error, encoded] = await TokenService.instance.sign(
				data,
				options
			);
			if (!error) {
				this.setCookie('session_token', encoded, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: true,
					path: '/',
				});
			}
		}
	);
});

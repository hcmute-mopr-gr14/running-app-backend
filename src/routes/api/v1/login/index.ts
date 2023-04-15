import { FastifyPluginAsync } from 'fastify';
import S from 'fluent-json-schema';

const login = (async (fastify, opts): Promise<void> => {
	const schema = {
		body: S.object()
			.prop('email', S.string().required())
			.prop('password', S.string().required()),
	};
	fastify.post('/', { schema }, async function (request, reply) {
		return {
			apiVersion: '1.0',
			data: {
				hello: 'world',
			},
		};
	});
}) satisfies FastifyPluginAsync;

export default login;

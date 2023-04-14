import { FastifyPluginAsync } from 'fastify';
import S from 'fluent-json-schema';

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
	const schema = {
		body: S.object()
			.prop('email', S.string().required())
			.prop('password', S.string().required()),
	};
	fastify.post('/', { schema }, async function (request, reply) {
		// TODO
	});
};

export default example;

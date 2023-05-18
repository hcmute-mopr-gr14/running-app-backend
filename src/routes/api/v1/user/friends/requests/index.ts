import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import post from './post';

const route = (async (fastify, opts): Promise<void> => {
	post(fastify);
}) satisfies FastifyPluginAsyncTypebox;

export default route;

import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import post from './post';
import put from './put';

const route = (async (fastify, opts): Promise<void> => {
	post(fastify);
	put(fastify);
}) satisfies FastifyPluginAsyncTypebox;

export default route;

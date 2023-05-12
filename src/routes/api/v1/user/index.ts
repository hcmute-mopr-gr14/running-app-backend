import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import get from './get';
import put from './put';
import post from './post';

const route = (async (fastify, opts): Promise<void> => {
	get(fastify);
	put(fastify);
	post(fastify);
}) satisfies FastifyPluginAsyncTypebox;

export default route;

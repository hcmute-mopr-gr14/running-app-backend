import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import post from './post';
import get from './get';

const route = (async (fastify, opts): Promise<void> => {
	get(fastify);
	post(fastify);
}) satisfies FastifyPluginAsyncTypebox;

export default route;

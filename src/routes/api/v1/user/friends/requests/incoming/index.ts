import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import get from './get';

const route = (async (fastify, opts): Promise<void> => {
	get(fastify);
}) satisfies FastifyPluginAsyncTypebox;

export default route;

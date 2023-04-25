import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import getUser from './get';

const route = (async (fastify, opts): Promise<void> => {
	getUser(fastify);
}) satisfies FastifyPluginAsyncTypebox;

export default route;

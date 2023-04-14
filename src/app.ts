import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import cookie from '@fastify/cookie';
import * as crypto from 'node:crypto';
import fastifyHelmet = require('@fastify/helmet');
import mongodbClient from './lib/services/mongodb-client';

export type AppOptions = {
	// Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};
const app: FastifyPluginAsync<AppOptions> = async (
	fastify,
	opts
): Promise<void> => {
	// Place here your custom code!
	fastify.register(cookie, {
		secret: crypto.randomBytes(256).toString('base64'),
		parseOptions: {},
	});

	fastify.register(fastifyHelmet);
	fastify.addHook('onClose', async () => {
		await mongodbClient.close(true);
	});

	// Do not touch the following lines

	// This loads all plugins defined in plugins
	// those should be support plugins that are reused
	// through your application
	void fastify.register(AutoLoad, {
		dir: join(__dirname, 'plugins'),
		options: opts,
	});

	// This loads all plugins defined in routes
	// define your routes in one of these
	void fastify.register(AutoLoad, {
		dir: join(__dirname, 'routes'),
		options: opts,
	});
};

export default app;
export { app, options };

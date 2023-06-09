import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import cookie from '@fastify/cookie';
import * as crypto from 'node:crypto';
import fastifyHelmet = require('@fastify/helmet');
import { DbClient } from './lib/services/db-client';
import * as dotenv from 'dotenv';
import { TokenService } from './lib/services/token-service';
import { ApiResponder } from './lib/services/api-responder';
import multipart from '@fastify/multipart';

export type AppOptions = {
	// Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

dotenv.config();

DbClient.useOptions({
	url: process.env.MONGO_URI,
	dbName: 'running-app',
});

TokenService.useOptions({
	// secret: crypto.randomBytes(256).toString('base64'),
	secret:
		process.env.JWT_SECRET || crypto.randomBytes(256).toString('base64'),
});

ApiResponder.useOptions({
	apiVersion: '1.0',
});

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
		await DbClient.instance.close(true);
	});

	fastify.register(multipart);

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

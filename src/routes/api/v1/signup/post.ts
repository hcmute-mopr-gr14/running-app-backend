import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import httpStatus = require('http-status');
import apiResponder from '~/lib/services/api-responder';
import apiResponseSchema from '~/lib/services/api-response-schema';
import mongodbCollections from '~/lib/services/mongodb-collections';
import * as bcrypt from 'bcrypt';

const post = (async (fastify): Promise<void> => {
	const schema = {
		body: Type.Object({
			email: Type.String(),
			password: Type.String(),
		}),
		response: {
			200: apiResponseSchema.ofData(Type.Object({})),
			400: apiResponseSchema.ofError(),
		},
	} satisfies FastifySchema;

	fastify.post('/', { schema }, async function (request, reply) {
		const existingUser = await mongodbCollections.users.countDocuments(
            { email: request.body.email },
            { limit: 1});
        if (existingUser) {
                reply
                  .status(httpStatus.BAD_REQUEST)
                  .send(
					apiResponder.error({
						code: httpStatus.UNAUTHORIZED,
						message: 'Email already exists',
					})
				);
                return;
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(request.body.password, 12);

        // Thêm tài khoản vào mongodb
        await mongodbCollections.users.insertOne({email: request.body.email, password: hashedPassword});

        reply
            .code(httpStatus.OK)
            .type('application/json')
            .send(apiResponder.data({ message: 'User created successfully' }));

	});
}) satisfies FastifyPluginAsyncTypebox;

export default post;

import {
    FastifyPluginAsyncTypebox,
    Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import httpStatus = require('http-status');
import { DbClient } from '~/lib/services/db-client';
import { ApiResponseSchema } from '~/lib/services/api-response-schema';
import { ApiResponder } from '~/lib/services/api-responder';
import * as bcrypt from 'bcrypt';

const post = (async (fastify): Promise<void> => {
    const schema = {
        body: Type.Object({
            email: Type.String(),
            password: Type.String(),
            nickname: Type.String(),
        }),
        response: {
            200: ApiResponseSchema.instance.ofData(Type.Object({})),
            400: ApiResponseSchema.instance.ofError(),
        },
    } satisfies FastifySchema;

    fastify.post('/', { schema }, async function (request, reply) {
        const existingUser = await DbClient.instance.collections.users.countDocuments(
            { email: request.body.email },
            { limit: 1 });

        if (existingUser) {
            reply
                .code(httpStatus.BAD_REQUEST)
                .type('application/json')
                .send(
                    ApiResponder.instance.error({
                        code: 'httpStatus.UNAUTHORIZED',
                        message: 'Email already exists',
                    })
                );
            return;
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(request.body.password, 12);

        // Thêm tài khoản vào mongodb
        await DbClient.instance.collections.users.insertOne({
			email: request.body.email,
			password: hashedPassword,
			nickname: request.body.nickname,
			level: 0,
			stepData: [{
				runningSeconds: 0,
                stepCount: 0,
                calories: 0,
				date: new Date().toISOString().substring(0, 10),
			}],
		});
		

        reply
            .code(httpStatus.OK)
            .type('application/json')
            .send(ApiResponder.instance.data({ message: 'User created successfully' }));

    });
}) satisfies FastifyPluginAsyncTypebox;

export default post;
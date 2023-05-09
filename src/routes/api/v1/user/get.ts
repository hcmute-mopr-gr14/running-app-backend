import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import httpStatus = require('http-status');
import { DbClient } from '~/lib/services/db-client';
import { ApiResponseSchema } from '~/lib/services/api-response-schema';
import { ApiResponder } from '~/lib/services/api-responder';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

const defaultimageUrl =
	'http://res.cloudinary.com/dymb8gidr/image/upload/v1683569585/running_app/6453b88a02adb65e9d167544_1683569589367.jpg';

const defaultNickname = 'Runner';

const get = (async (fastify): Promise<void> => {
	const schema = {
		response: {
			'2xx': ApiResponseSchema.instance.ofData(
				Type.Object({
					email: Type.String(),
					nickname: Type.String(),
					imageUrl: Type.String(),
				})
			),
			'4xx': ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.get('/', { schema }, async function (request, reply) {
		// Kiểm tra session đăng nhập
		if (!request.session?.user?._id) {
			reply
				.code(httpStatus.UNAUTHORIZED)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'httpStatus.UNAUTHORIZED',
						message: 'Unauthorized access',
					})
				);
			return;
		}

		const user = await DbClient.instance.collections.users.findOne(
			{ _id: new ObjectId(request.session.user._id) },
			{
				projection: {
					_id: 1,
					email: 1,
					nickname: 1,
				},
			}
		);

		const imageUrl = user
			? cloudinary.image(user.publicId, { version: user.version })
			: defaultimageUrl;

		const nickname = user
			? user.nickname || defaultNickname
			: defaultNickname;

		if (!user) {
			reply
				.code(httpStatus.NOT_FOUND)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'httpStatus.NOT_FOUND',
						message: 'User not found',
					})
				);
			return;
		}

		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(
				ApiResponder.instance.data({
					email: user.email,
					nickname: nickname,
					imageUrl: imageUrl,
				})
			);
	});
}) satisfies FastifyPluginAsyncTypebox;

export default get;

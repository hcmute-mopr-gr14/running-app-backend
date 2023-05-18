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
import { ObjectId } from 'mongodb';

const put = (async (fastify): Promise<void> => {
	const schema = {
		body: Type.Object({
			currentPassword: Type.String(),
			newPassword: Type.String(),
			nickname: Type.Optional(Type.String()),
		}),
		response: {
			200: ApiResponseSchema.instance.ofData(
				Type.Object({
					message: Type.String(),
				})
			),
			400: ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.put('/', { schema }, async function (request, reply) {
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

		const user = await DbClient.instance.collections.users.findOne({
			_id: new ObjectId(request.session.user._id),
		});

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

		// Kiểm tra mật khẩu hiện tại có chính xác không
		const isCorrect = await bcrypt.compare(
			request.body.currentPassword,
			user.password
		);

		if (!isCorrect) {
			reply
				.code(httpStatus.UNAUTHORIZED)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'httpStatus.UNAUTHORIZED',
						message: 'Current password is incorrect',
					})
				);
			return;
		}

		// Cập nhật mật khẩu mới (nếu được cung cấp)
		const updateFields: any = {};

		if (request.body.newPassword) {
			const hashedPassword = await bcrypt.hash(
				request.body.newPassword,
				12
			);
			updateFields.password = hashedPassword;
		}

		// Cập nhật nickname mới (nếu được cung cấp)
		if (request.body.nickname) {
			updateFields.nickname = request.body.nickname;
		}

		// Cập nhật trong MongoDB
		await DbClient.instance.collections.users.updateOne(
			{ _id: user._id },
			{ $set: updateFields }
		);

		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(
				ApiResponder.instance.data({
					message: 'User info updated successfully',
				})
			);
	});
}) satisfies FastifyPluginAsyncTypebox;

export default put;

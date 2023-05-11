import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import httpStatus = require('http-status');
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { DbClient } from '~/lib/services/db-client';
import { ApiResponseSchema } from '~/lib/services/api-response-schema';
import { ApiResponder } from '~/lib/services/api-responder';
import { ObjectId } from 'mongodb';
import * as sharp from 'sharp';

// Configuration
cloudinary.config({
	cloud_name: 'dymb8gidr',
	api_key: '973186928181738',
	api_secret: '13eO2TcSsK5V8R2G_GbEDavAaPE',
});

const uploadImage = (
	imageBuffer: Buffer,
	options: any
): Promise<UploadApiResponse | undefined> => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(options, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			})
			.end(imageBuffer);
	});
};

const post = (async (fastify): Promise<void> => {
	const schema = {
		response: {
			200: ApiResponseSchema.instance.ofData(
				Type.Object({
					message: Type.String(),
				})
			),
			400: ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.post('/', { schema }, async function (request, reply) {
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

		const data = await request.file();
		if (data) {
			const fileBuffer = await data.toBuffer();
			const timestamp = Date.now();
			const uniqueFileName = `${request.session.user._id}_${timestamp}`; // Tạo tên file duy nhất
			const options = {
				public_id: uniqueFileName,
				folder: 'running_app',
			};

			const resizedImageBuffer = await sharp(fileBuffer)
				.resize(100, 100) // Chiều rộng là 100px, chiều cao tự động theo tỉ lệ
				.toBuffer();

			try {
				const result = await uploadImage(resizedImageBuffer, options);
				console.log(result);

				// Cập nhật avatarUrl trong MongoDB
				await DbClient.instance.collections.users.updateOne(
					{ _id: user._id },
					{
						$set: {
							publicId: result?.public_id,
							version: result?.version,
						},
					}
				);

				reply
					.code(httpStatus.OK)
					.type('application/json')
					.send(
						ApiResponder.instance.data({
							message: 'User avatar URL updated successfully',
							publicId: result?.public_id,
							version: result?.version,
						})
					);
			} catch (error) {
				console.log(error);
			}
		} else {
			reply
				.code(httpStatus.NOT_FOUND)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'httpStatus.NOT_FOUND',
						message: 'File not found',
					})
				);
			return;
		}
	});
}) satisfies FastifyPluginAsyncTypebox;

export default post;

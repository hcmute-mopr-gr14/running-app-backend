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

const get = (async (fastify): Promise<void> => {
	const schema = {
		querystring: Type.Object({
            email: Type.String(),
		}),
		response: {
			200: ApiResponseSchema.instance.ofData(Type.Object({
				nickname: Type.String(),
				runningLogs: Type.Array(Type.Object({
					_id: Type.String(),
					seconds: Type.Integer(),
					steps: Type.Integer(),
					distance: Type.Integer(),
				})),
			})),
			400: ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.get('/', { schema }, async function (request, reply) {
        const user = await DbClient.instance.collections.users.findOne(
            { email: request.query.email },
            { projection: { nickname: 1, runningLogs: 1 } }
        );

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
		} else if (!user.runningLogs) {
			reply
				.code(httpStatus.INTERNAL_SERVER_ERROR)
				.type('application/json')
				.send(ApiResponder.instance.error({
					code: 'httpStatus.INTERNAL_SERVER_ERROR',
					message: 'RunningLogs not found',
				}));
			return;
		} else {
			// Kiểm tra dữ liệu trong mảng runningLogs có dữ liệu của ngày hôm nay ?, nếu chưa thì tạo dữ liệu mặc định
			const today = new Date();
			const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
			let hasTodayLog = false;

			for (const log of user.runningLogs) {
    			const logDate = new Date(log._id.getTimestamp());
    			const logDateString = `${logDate.getFullYear()}-${logDate.getMonth() + 1}-${logDate.getDate()}`;
    			if (logDateString === todayString) {
        			hasTodayLog = true;
        			break;
    			}
			}

			if (!hasTodayLog) {
    			const defaultLog = {
        		_id: new ObjectId(),
        		seconds: 0,
        		steps: 0,
        		distance: 0,
    		};
			user.runningLogs.push(defaultLog);

			// Cập nhật dữ liệu mặc định vào database
			await DbClient.instance.collections.users.updateOne(
				{ email: user.email },
				{ $set: { runningLogs: user.runningLogs } }
				);
			}
		}
		
		reply
    		.code(httpStatus.OK)
    		.type('application/json')
    		.send(ApiResponder.instance.data({
        		nickname: user.nickname,
        		runningLogs: user.runningLogs.map(log => ({
            		_id: log._id.toHexString(),
            		seconds: log.seconds,
            		steps: log.steps,
            		distance: log.distance
        		})),
    		}));
		});
	}) satisfies FastifyPluginAsyncTypebox;

export default get;
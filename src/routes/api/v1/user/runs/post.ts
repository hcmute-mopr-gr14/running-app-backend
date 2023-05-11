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
import { Round } from '~/lib/models/user';
import { UpdateResult } from 'mongodb';

const post = (async (fastify): Promise<void> => {
	const schema = {
		body: Type.Object({
			date: Type.String(),
			round: Type.Object({
				points: Type.Array(
					Type.Object({
						lat: Type.Number(),
						lng: Type.Number(),
					})
				),
				meters: Type.Number(),
				seconds: Type.Number(),
			}),
		}),
		response: {
			'2xx': ApiResponseSchema.instance.ofData(Type.Any()),
			'4xx': ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.post('/', { schema }, async function (request, reply) {
		if (!request.session) {
			reply
				.code(httpStatus.UNAUTHORIZED)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'UNAUTHORIZED_ERROR',
						message: 'Not authorized',
					})
				);
			return;
		}

		let date: Date;
		if (!isNaN(Date.parse(request.body.date))) {
			date = new Date(request.body.date);
		} else {
			reply
				.code(httpStatus.BAD_REQUEST)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'DATE_ERROR',
						message: 'Invalid date format, needs to be yyyy-mm-dd',
					})
				);
			return;
		}

		const current = await DbClient.instance.collections.users
			.aggregate([
				{ $match: { _id: new ObjectId(request.session.user._id) } },
				{ $project: { runs: { date: 1, _id: 1 }, _id: 0 } },
				{ $unwind: '$runs' },
				{ $replaceRoot: { newRoot: '$runs' } },
				{ $match: { date: date.toISOString().split('T', 1)[0] } },
				{ $limit: 1 },
			])
			.next();

		let updateResult: UpdateResult;
		if (current) {
			updateResult = await DbClient.instance.collections.users.updateOne(
				{
					_id: new ObjectId(request.session.user._id),
					'runs._id': current._id,
				},
				{ $push: { 'runs.$.rounds': request.body.round } }
			);
		} else {
			updateResult = await DbClient.instance.collections.users.updateOne(
				{
					_id: new ObjectId(request.session.user._id),
				},
				{
					$push: {
						runs: {
							_id: new ObjectId(date.getTime() / 1000),
							date: date.toISOString().split('T', 1)[0],
							rounds: [request.body.round as Round],
						},
					},
				}
			);
		}
		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(ApiResponder.instance.data(updateResult));
	});
}) satisfies FastifyPluginAsyncTypebox;

export default post;

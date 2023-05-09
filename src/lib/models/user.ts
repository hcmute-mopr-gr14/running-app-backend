import { ObjectId } from 'mongodb';

export default interface User {
	email: string;
	password: string;
	nickname: string;
	runs?: Run[];
}

interface Run {
	_id: ObjectId;
	rounds: Round[];
}

interface Round {
	points: [number, number][];
	meters: number;
	seconds: number;
}

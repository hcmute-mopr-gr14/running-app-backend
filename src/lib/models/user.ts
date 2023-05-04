import { ObjectId } from 'mongodb';

export default interface User {
	email: string;
	password: string;
	sessionToken?: string;
	nickname: string;
	runningLogs?: RunningLog[];
}

interface RunningLog {
	_id: ObjectId;
	seconds: number;
	steps: number;
	distance: number;
}

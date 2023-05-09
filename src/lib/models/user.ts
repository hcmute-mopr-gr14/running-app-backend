import { ObjectId } from 'mongodb';

export default interface User {
	email: string;
	password: string;
	nickname: string;
	runs?: Run[];
	publicId: string;
	version: number;
}

export interface Run {
	_id: ObjectId;
	date: string;
	rounds: Round[];
}

export interface Round {
	points: LatLng[];
	meters: number;
	seconds: number;
}

export interface LatLng {
	lat: number;
	lng: number;
}

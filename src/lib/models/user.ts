export default interface User {
	email: string;
	password: string;
	sessionToken?: string;
	nickname: string;
	level: number;
	stepData: StepData[];
}

interface StepData {
	runningSeconds: number;
	stepCount: number;
	calories: number;
	date: string;
}
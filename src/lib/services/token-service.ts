import * as jwt from 'jsonwebtoken';
import * as crypto from 'node:crypto';

class TokenService {
	constructor(private secret: jwt.Secret) {}
	public sign(payload: string | Buffer | object, options?: jwt.SignOptions) {
		return new Promise<[Error | null, string]>((resolve) => {
			jwt.sign(payload, this.secret, options ?? {}, (error, encoded) => {
				resolve([error, encoded!]);
			});
		});
	}
	public verify(token: string) {
		return new Promise<[jwt.VerifyErrors | null, string | jwt.JwtPayload]>(
			(resolve) => {
				jwt.verify(token, this.secret, (error, decoded) => {
					resolve([error, decoded!]);
				});
			}
		);
	}
}

export default new TokenService(crypto.randomBytes(256).toString('base64'));

import * as jwt from 'jsonwebtoken';

interface TokenServiceOptions {
	secret: jwt.Secret;
}

export class TokenService {
	private static _instance: TokenService;
	private static _options: TokenServiceOptions;

	private secret: jwt.Secret;

	private constructor(options: TokenServiceOptions) {
		this.secret = options.secret;
	}

	public static useOptions(options: TokenServiceOptions) {
		this._options = options;
	}

	public static get instance() {
		if (!this._instance) {
			if (!this._options) {
				throw new Error(
					'TokenService needs an options to construct its instance'
				);
			}
			this._instance = new TokenService(this._options);
		}
		return this._instance;
	}

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

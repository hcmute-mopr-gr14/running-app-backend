import User from '../models/user';
import { v2 as cloudinary } from 'cloudinary';

export function withImageUrl(
	user: User
): Omit<User, 'publicId' | 'version'> & { imageUrl: string } {
	const clone = Object.assign(user, {
		imageUrl: user.image
			? cloudinary.url(user.image.publicId, {
					version: user.image.version,
					format: user.image.format,
					resource_type: 'image',
			  })
			: '',
	});
	delete (clone as any).image;
	return clone;
}

import User from '../models/user';
import { CommonTransformationOptions, v2 as cloudinary } from 'cloudinary';

export function withImageUrl(
	user: User,
	transformation?: CommonTransformationOptions
): Omit<User, 'publicId' | 'version'> & { imageUrl: string } {
	const clone = Object.assign(user, {
		imageUrl: user.image
			? cloudinary.url(user.image.publicId, {
					version: user.image.version,
					format: user.image.format,
					resource_type: 'image',
					secure: true,
					transformation,
			  })
			: 'https://res.cloudinary.com/dymb8gidr/image/upload/v1683569585/running_app/6453b88a02adb65e9d167544_1683569589367.jpg',
	});
	delete (clone as any).image;
	return clone;
}

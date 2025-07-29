import { BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

export class FilesUpload {

	static files() {
		return FileFieldsInterceptor([
			{ name: 'mainIcon', maxCount: 1 },
			{ name: 'galleryIcons', maxCount: 3 }
		], {
			limits: { fileSize: 5 * 1024 * 1024 },
			fileFilter(req, file, cb) {
				if(!file.mimetype.match(/\/(jpg|jpeg|png|img|webp)$/)) {
					return cb(new BadRequestException(
						'Only image file are allowed (jpg, jpeg, png, img, webp)!'), false)
				}
				return cb(null, true)
			},
		})
	}
}


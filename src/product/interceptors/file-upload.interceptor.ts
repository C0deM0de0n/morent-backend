import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

export class FilesUpload {
	static images() {
		return FilesInterceptor('files', 3, {
			limits: { fileSize: 5 * 1024 * 1024 },
			fileFilter: (req, file, cb) => {
				if(!file.mimetype.match(/\/(jpg|jpeg|png|img|webp)$/)) {
					return cb(new BadRequestException(
						'Only image files are allowed (jpg, jpeg, png, img)!'), false)
				}
				return cb(null, true)
			}
		})
	}
}


import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Storage, Bucket } from '@google-cloud/storage'

@Injectable()
export class GoogleCloudService {
	private storage: Storage
	private bucket: Bucket

	constructor(private configService: ConfigService) {
		const bucketName = this.configService.get<string>(
			'GOOGLE_BUCKET_NAME'
		) as string
		const keys = this.configService.get<string>('GOOGLE_KEYS') as string
		this.storage = new Storage({ keyFilename: keys })
		this.bucket = this.storage.bucket(bucketName)
	}

	async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
		const upload = files.map((file) => {
			const fileUpload = this.bucket.file(file.originalname)

			return new Promise<string>((resolve, reject) => {
				const stream = fileUpload.createWriteStream({
					metadata: { contentType: file.mimetype },
				})

				stream.on('error', (error) => reject(error))
				stream.on('finish', () =>
					resolve(
						`https://storage.googleapis.com/${this.bucket.name}/${fileUpload.name}`
					)
				)
				stream.end(file.buffer)
			})
		})

		return Promise.all(upload)
	}

	async deleteFiles(urls: string[]): Promise<void> {
		const deletePromises = urls.map((url) => {
			const fileName = this.extractFileName(url)
			return this.bucket.file(fileName).delete()
		})

		await Promise.all(deletePromises)
	}

	extractFileName(url: string): string {
		const match = url.match(/\/([^\/?#]+)(?:\?.*)?$/)
		if (!match) throw new BadRequestException(`Could not extract filename from URL: ${url}`)
		return match[1]
	}
}

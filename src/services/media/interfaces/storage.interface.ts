export interface IStorageService {
  uploadFile(key: string, body: Buffer, contentType: string): Promise<string>;
  getFileUrl(key: string, expiresIn: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileStream(key: string): Promise<NodeJS.ReadableStream>;
}


export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  maxRetries: number;
  timeout: number;
}

export interface FileMetadata {
  courseId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadId?: string;
  checksum?: string;
  tags?: Record<string, string>;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expires: number;
  uploadId?: string;
}

export interface MultipartUploadResult {
  uploadId: string;
  fileUrl: string;
  key: string;
  parts: Array<{
    partNumber: number;
    uploadUrl: string;
    expires: number;
  }>;
}

export interface CompletedPart {
  partNumber: number;
  etag: string;
}

export interface UploadedPart {
  partNumber: number;
  etag: string;
  size: number;
  lastModified: Date;
}

export interface ListPartsResult {
  parts: UploadedPart[];
  isTruncated: boolean;
  nextPartNumberMarker?: number;
}

export interface CompleteMultipartResult {
  url: string;
  location: string;
  etag: string;
}

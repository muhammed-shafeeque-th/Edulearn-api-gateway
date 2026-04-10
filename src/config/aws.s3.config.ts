import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { config as appConfig } from './dev-config';

const createS3Client = (): S3Client => {
  const config: S3ClientConfig = {
    region: appConfig.s3.region || 'us-east-1',
    maxAttempts: 3,
    requestHandler: {
      requestTimeout: 30000,
      httpsAgent: {
        maxSockets: 50,
      },
    },
  };

  if (appConfig.nodeEnv === 'development' && appConfig.s3.accessKey) {
    config.credentials = {
      accessKeyId: appConfig.s3.accessKey,
      secretAccessKey: appConfig.s3.accessSecret!,
    };
  }

  return new S3Client(config);
};

export const s3Client = createS3Client();

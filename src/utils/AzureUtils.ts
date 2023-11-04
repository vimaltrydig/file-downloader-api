import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

// create a utility class AzureUtils.ts in src/utils folder and add the following code:
export function getAzureContainerClient(
  containerName: string
): ContainerClient | undefined {
  if (!containerName) {
    return;
  }

  // get account name and key for Azure storage account from env file
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";

  // if account name or key is missing return error
  if (!accountName || !accountKey) {
    return;
  }

  // create shared key credential for the storage account
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  // create blob service client for the storage account
  const blobService = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
  );

  try {
    const containerClient: ContainerClient =
      blobService.getContainerClient(containerName);

    return containerClient;
  } catch (error) {
    return;
  }
}

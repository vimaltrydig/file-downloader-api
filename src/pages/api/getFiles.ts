import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { NextApiRequest, NextApiResponse } from "next";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const params = req.query;

  let blobFiles: string[] = [];

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";

  if (!accountName || !accountKey) {
    res.status(404).json({
      status: 404,
      message: "Azure storage account settings missing in env file!",
    });
  }

  const containerName = params.id as string;

  if (containerName === undefined) {
    res.status(404).json({
      status: 404,
      message: "id/container name is mandatory field for getFiles!",
    });
  }

  if (req.method == "GET") {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );

    const blobService = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    try {
      const containerClient: ContainerClient =
        blobService.getContainerClient(containerName);

      for await (const blob of containerClient.listBlobsFlat()) {
        if (blob.name && blob.properties.createdOn !== undefined) {
          blobFiles.push(blob.name);
        }
      }
    } catch (error) {
      res.status(404).json({
        status: 404,
        message: "Failed to fetch file from object storage!",
      });
    }

    return res.status(200).json({ result: blobFiles });
  } else {
    res.status(404).json({
      status: 404,
      message: "unsupported request method!",
    });
  }
}

export default handler;

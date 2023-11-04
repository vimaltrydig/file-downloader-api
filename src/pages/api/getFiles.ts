import { NextApiRequest, NextApiResponse } from "next";
import { getAzureContainerClient } from "@/utils/AzureUtils";
import type { ContainerClient } from "@azure/storage-blob";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const params = req.query;

  // get container name from query params
  const containerName = params.id as string;

  // if container name is missing return error
  if (containerName === undefined) {
    return res.status(404).json({
      status: 404,
      message: "id/container name is mandatory field for getFiles!",
    });
  }

  // if request method is GET
  if (req.method == "GET") {
    let blobFiles: string[] = [];

    const containerClient: ContainerClient | undefined =
      getAzureContainerClient(containerName);

    if (!containerClient) {
      return res.status(404).json({
        status: 404,
        message: "Unable to connect with storage account. Aborting!",
      });
    }

    try {
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

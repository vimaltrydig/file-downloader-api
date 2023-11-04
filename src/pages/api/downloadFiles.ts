import { getAzureContainerClient } from "@/utils/AzureUtils";
import type { ContainerClient } from "@azure/storage-blob";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import archiver from "archiver";
import path from "path";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const params = req.query;

  // get container name from query params
  const containerName = params.id as string;

  // if container name is missing return error
  if (containerName === undefined) {
    return res.status(404).json({
      status: 404,
      message: "id/container name is mandatory param!",
    });
  }

  let blobFiles: string[] = [];
  blobFiles = JSON.parse(params.files as string);

  // if container name is missing return error
  if (blobFiles && blobFiles.length === 0) {
    return res.status(200).json({
      status: 404,
      message: "files is mandatory param!",
    });
  }

  const containerClient: ContainerClient | undefined =
    getAzureContainerClient(containerName);

  if (!containerClient) {
    return res.status(404).json({
      status: 404,
      message: "Unable to connect with storage account. Aborting!",
    });
  }

  // if request method is GET
  if (req.method == "GET") {
    // create archiver for zip
    const archive = archiver("zip");

    // catch warnings
    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        // log warning
        console.log(err);
      } else {
        res.status(404).json({
          status: 404,
          message: err,
        });
      }
    });

    // catch errors
    archive.on("error", function (err) {
      res.status(404).json({
        status: 404,
        message: err,
      });
    });

    // if only one file selected we will not zip
    if (blobFiles.length === 1) {
      const blobname = blobFiles[0];
      const filename = path.basename(blobFiles[0]);

      console.log(`Initiating downloading of blob file '${blobname}'`);

      res.writeHead(200, {
        "Content-disposition": `attachment; filename="${filename}"`,
      });

      // get blob client for the blobfile
      const blobClient = containerClient.getBlobClient(blobname);

      // get readstream for the blobfile
      const downloadResponse = await blobClient.download();

      if (downloadResponse.readableStreamBody !== undefined) {
        // pipe the read stream to response
        downloadResponse.readableStreamBody.pipe(res);
      }
    } else {
      const zipFilename = `sample-file.zip`;
      res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-disposition": `attachment; filename=${zipFilename}`,
      });

      // bind altered header to response
      archive.pipe(res);

      // loop through all the files and add to archive
      await Promise.all(
        blobFiles.map(async (blobname) => {
          const sourceBlobClient = containerClient.getBlobClient(blobname);

          // get readstream for the blobfile
          const downloadResponse = await sourceBlobClient.download();

          if (downloadResponse.readableStreamBody !== undefined) {
            // apend readstream to archive
            archive.append(
              downloadResponse.readableStreamBody as NodeJS.ReadStream,
              {
                name: blobname,
              }
            );
          }
        })
      );
    }

    // finalize the archive
    archive.finalize();
  } else {
    res.status(404).json({
      status: 404,
      message: "unsupported request method!",
    });
  }
}

// it is important to disble body parser as archiver use its own
export const config: PageConfig = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

export default handler;

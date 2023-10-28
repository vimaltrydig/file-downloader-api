import {
    BlobServiceClient,
    ContainerClient,
    StorageSharedKeyCredential,
  } from "@azure/storage-blob";
  import { NextApiRequest, NextApiResponse, PageConfig } from "next";
  import archiver from "archiver";
  import path from "path";
    
  export async function handler(req: NextApiRequest, res: NextApiResponse) {
  
    const params = req.query;
      
    let blobFiles: string[] = [];    
    blobFiles = JSON.parse(params.files as string);
  
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";

    if ( !accountName || !accountKey ) {
      res.status(404).json({
        status: 404,
        message: "Azure storage account settings missing in env file!",
      });
    }

    const containerName = params.id as string;
    const zipFilename = `sample-file.zip`;
  
    if (req.method == "GET") {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        accountName,
        accountKey
      );
  
      const blobService = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
      );
  
      const containerClient: ContainerClient =
      blobService.getContainerClient(containerName);
    
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
    
          const blobClient = containerClient.getBlobClient(blobname);
    
          // get readstream for the blobfile
          const downloadResponse = await blobClient.download();
    
          if (downloadResponse.readableStreamBody !== undefined) {
            // pipe the read stream to response
            downloadResponse.readableStreamBody.pipe(res);
          }
        } else {
          res.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-disposition": `attachment; filename=${zipFilename}`,
          });
    
          // bind altered header to response
          archive.pipe(res);
    
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
      },
    };
    
    export default handler;
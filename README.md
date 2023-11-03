File downloader API to download files from Azure storage account as stream.

## Prerequisite

Create .env file from .env.example template file.
Add the Azure connection settings in environmental file.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the server running.

<img width="938" alt="image" src="https://github.com/vimaltrydig/file-downloader-api/assets/104626021/a6425078-2c3d-4ef3-865a-cb702f16dd7b">

## API info

Call the API with GET request directly from browser or postman

```bash
http://localhost:3000/api/downloadFile?id=<containername>&files=<["file1"]>
http://localhost:3000/api/getFiles?id=<containername>
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

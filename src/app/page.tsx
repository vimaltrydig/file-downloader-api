import List from "./List";

export default async function Home() {
  // Get host name and container name from environment variables
  const hostName = process.env.NEXTAUTH_URL || "";
  const containerName = process.env.NEXT_PUBLIC_STORAGE_CONTAINER_NAME || "";

  let Files: string[] = [];

  // Get files from API and set it to state variable
  await fetch(`${hostName}/api/getFiles?id=${containerName}`)
    .then((response) => response.json())
    .then((data) => {
      Files = data.result;
    })
    .catch((error) => console.error(error));

  return (
    <main className="flex min-h-screen flex-col items-center gap-5 p-24">
      <h1 className="text-lg font-bold">Welcome to file downloader API</h1>
      <p>
        Select files that you want to download. Click on download button to
        start downloading the file
      </p>
      <List files={Files} hostName={hostName} id={containerName} />
    </main>
  );
}

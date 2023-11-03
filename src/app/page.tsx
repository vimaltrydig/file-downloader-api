import List from "../pages/List";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-5 p-24">
      <h1 className="text-lg font-bold">Welcome to file downloader API</h1>
      <p>
        Select files that you want to download. Click on download button to
        start downloading the file
      </p>
      <List />
    </main>
  );
}

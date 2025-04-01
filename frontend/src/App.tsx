import React, { useEffect, useState } from "react";
import "./App.css";
import FileUpload from "./components/file-upload";
import Search from "./components/search";
import { searchData } from "./services/csv-api";
import Loading from "./components/loading";

function App() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const csvData = await searchData({ limit: 1 });
        setHeaders(csvData.headers);
        setIsFileUploaded(true);
      } catch (_error) {
        setHeaders([]);
        setIsFileUploaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleUploadSuccess = (uploadedHeaders: string[]) => {
    setHeaders(uploadedHeaders);
    setIsFileUploaded(true);
  };

  return (
    <div className="App">
      {isLoading && <Loading />}
      <header className="App-header">
        <h1>CSV Explorer</h1>
      </header>
      <main>
        {!isFileUploaded ? (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <Search headers={headers} />
        )}
      </main>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { searchData } from "../../services/csv-api";
import "./Search.css";
import Loading from "../loading";

interface SearchProps {
  headers: string[];
}

interface SearchResult {
  data: Record<string, string>;
}

export default function Search({ headers }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<string>(headers[0]);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const csvData = await searchData({ page: 1, limit: pageSize });
        setTotalCount(csvData.totalCount);
        setResults(csvData.dataEntries);
        setError(null);
      } catch (_error) {
        setTotalCount(0);
        setResults([]);
        setError("Failed to fetch initial data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const cleanHeader = (header: string) => {
    return header.replace(/['"]+/g, "");
  };

  const handleSearch = async (e: React.FormEvent, page = 1) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const result = await searchData({
        term: searchTerm,
        column: selectedColumn,
        exact: isExactMatch,
        page,
        limit: pageSize,
      });
      setResults(result.dataEntries);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch({ preventDefault: () => {} } as React.FormEvent, page);
  };

  return (
    <div className="search-container">
      {isLoading && <Loading />}
      <h2>Search CSV Data</h2>
      <form onSubmit={handleSearch}>
        <div className="search-controls">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term"
            disabled={isLoading}
          />

          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            disabled={isLoading}
          >
            {headers.map((header) => (
              <option key={header} value={header}>
                {cleanHeader(header)}
              </option>
            ))}
          </select>

          <label className="exact-match">
            <input
              type="checkbox"
              checked={isExactMatch}
              onChange={(e) => setIsExactMatch(e.target.checked)}
              disabled={isLoading}
            />
            Exact Match
          </label>

          <button type="submit" disabled={isLoading}>
            Search
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {results.length > 0 && <p>{`${totalCount} results found`}</p>}

      <div className="results-container">
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{cleanHeader(header)}</th>
              ))}
            </tr>
          </thead>
          {results.length > 0 && (
            <tbody>
              {results.map((row, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={`${index}-${header}`}>{row.data[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {results.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {Math.ceil(totalCount / pageSize)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage >= Math.ceil(totalCount / pageSize) || isLoading
              }
            >
              Next
            </button>
          </div>
        )}

        {results.length === 0 && <p>No results found</p>}
      </div>
    </div>
  );
}

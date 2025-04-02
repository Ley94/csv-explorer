import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { searchData } from "./services/csv-api";

jest.mock("./services/csv-api");
const mockSearchData = searchData as jest.MockedFunction<typeof searchData>;

jest.mock("./components/file-upload", () => {
  return function MockFileUpload() {
    return <div data-testid="mock-file-upload">File Upload Component</div>;
  };
});

jest.mock("./components/search", () => {
  return function MockSearch() {
    return <div data-testid="mock-search">Search Component</div>;
  };
});

describe("App Component", () => {
  const mockSearchDataResponse = {
    headers: ["name", "age"],
    dataEntries: [],
    totalCount: 0,
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", async () => {
    render(<App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    const heading = await waitFor(() =>
      screen.getByRole("heading", { name: /CSV Explorer/i })
    );
    expect(heading).toBeInTheDocument();
  });

  it("should initially render file upload component", async () => {
    mockSearchData.mockRejectedValue(new Error("No file"));
    render(<App />);
    const fileUploadComponent = await waitFor(() =>
      screen.getByTestId("mock-file-upload")
    );
    expect(fileUploadComponent).toBeInTheDocument();
    expect(screen.queryByTestId("mock-search")).not.toBeInTheDocument();
  });

  it("should render search component when file is uploaded", async () => {
    mockSearchData.mockResolvedValue(mockSearchDataResponse);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-search")).toBeInTheDocument();
      expect(screen.queryByTestId("mock-file-upload")).not.toBeInTheDocument();
    });
  });
});

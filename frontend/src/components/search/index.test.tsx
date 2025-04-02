import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Search from ".";
import { searchData } from "../../services/csv-api";

jest.mock("../../services/csv-api");
const mockSearchData = searchData as jest.MockedFunction<typeof searchData>;

describe("Search Component", () => {
  const mockSearchResponse = {
    headers: ["name", "age"],
    totalCount: 2,
    dataEntries: [
      { id: 1, data: { name: "John", age: "30" } },
      { id: 2, data: { name: "Jane", age: "25" } },
    ],
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchData.mockResolvedValue(mockSearchResponse);
  });

  it("should render all search interface elements", async () => {
    render(<Search headers={mockSearchResponse.headers} />);

    // Search input
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // Column dropdown
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    for (const header of mockSearchResponse.headers) {
      const option = await waitFor(() =>
        screen.getByRole("option", { name: header })
      );
      expect(option).toBeInTheDocument();
    }

    // Exact match checkbox
    const exactCheckbox = screen.getByRole("checkbox");
    expect(exactCheckbox).toBeInTheDocument();
    expect(exactCheckbox).not.toBeChecked();

    // Search button
    const searchButton = await waitFor(() =>
      screen.getByRole("button", { name: /search/i })
    );
    expect(searchButton).toBeInTheDocument();
  });

  it("should perform search when term is entered", async () => {
    render(<Search headers={mockSearchResponse.headers} />);
    const input = screen.getByRole("textbox");
    const column = screen.getByRole("combobox");

    await userEvent.selectOptions(column, "name");
    await userEvent.type(input, "John");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSearchData).toHaveBeenCalledWith({
      term: "John",
      column: "name",
      exact: false,
      page: 1,
      limit: 10,
    });
  });

  it("should display search results", async () => {
    render(<Search headers={mockSearchResponse.headers} />);
    const input = screen.getByRole("textbox");

    await userEvent.type(input, "John");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("should handle pagination", async () => {
    const mockSearchLargeResponse = {
      ...mockSearchResponse,
      totalCount: 100,
      dataEntries: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        data: { name: `User ${i + 1}`, age: `${i + 10}` },
      })),
    };
    mockSearchData.mockResolvedValue(mockSearchLargeResponse);
    render(<Search headers={mockSearchResponse.headers} />);
    const nextButton = await waitFor(() =>
      screen.getByRole("button", { name: /next/i })
    );

    await userEvent.click(nextButton);

    expect(screen.getByText(/page 2/i)).toBeInTheDocument();
    expect(mockSearchData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 2,
      })
    );
  });

  it("should handle search errors", async () => {
    mockSearchData.mockRejectedValue(new Error("Search failed"));
    render(<Search headers={mockSearchResponse.headers} />);

    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(screen.getByText(/fail/i)).toBeInTheDocument();
  });
});

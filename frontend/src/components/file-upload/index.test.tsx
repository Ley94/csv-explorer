import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUpload from ".";
import { uploadCsv } from "../../services/csv-api";

jest.mock("../../services/csv-api");

describe("FileUpload Component", () => {
  const mockUploadCsv = uploadCsv as jest.MockedFunction<typeof uploadCsv>;
  const mockUploadResponse = {
    message: "Upload successful",
    headers: ["name", "age"],
    rowCount: 2,
  };
  const mockOnUploadSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadCsv.mockResolvedValue(mockUploadResponse);
  });

  it("should render file upload interface", async () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

    const uploadButton = await waitFor(() =>
      screen.getByRole("button", { name: /upload/i })
    );
    const fileInput = screen.getByTestId("file-input");

    expect(uploadButton).toBeInTheDocument();
    expect(fileInput).toBeInTheDocument();
  });

  it("should handle file selection and upload", async () => {
    const file = new File(["test,data\n1,2"], "test.csv", { type: "text/csv" });

    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

    const input = screen.getByTestId("file-input");
    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /upload/i }));

    expect(mockUploadCsv).toHaveBeenCalledWith(file, expect.any(Function));
    expect(screen.getByText(/successful/i)).toBeInTheDocument();
  });

  it("should display error on upload failure", async () => {
    const file = new File(["invalid"], "test.csv", { type: "text/csv" });
    mockUploadCsv.mockRejectedValue(new Error("Upload failed"));

    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

    const input = screen.getByTestId("file-input");
    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /upload/i }));

    expect(screen.getByText(/fail/i)).toBeInTheDocument();
  });
});

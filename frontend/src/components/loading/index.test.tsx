import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Loading from ".";

describe("Loading Component", () => {
  it("should display loading text", () => {
    render(<Loading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render loading spinner", () => {
    render(<Loading />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});

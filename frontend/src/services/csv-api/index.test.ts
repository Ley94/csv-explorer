import { API_BASE_URL, uploadCsv, searchData } from ".";

describe("CSV API", () => {
  describe("uploadCsv", () => {
    let xhrMock: any;
    const mockSuccessResponse = {
      message: "Success",
      rowCount: 2,
      headers: ["name", "age"],
    };

    beforeEach(() => {
      xhrMock = {
        open: jest.fn(),
        send: jest.fn(),
        upload: {
          onprogress: null,
        },
        setRequestHeader: jest.fn(),
        status: 201,
        response: JSON.stringify(mockSuccessResponse),
      };

      global.XMLHttpRequest = jest.fn(
        () => xhrMock
      ) as unknown as typeof XMLHttpRequest;
    });

    it("should handle successful upload", async () => {
      const file = new File(["test"], "test.csv", { type: "text/csv" });
      const promise = uploadCsv(file);

      xhrMock.onload();

      const result = await promise;
      expect(result).toEqual(mockSuccessResponse);
    });

    it("should report upload progress", async () => {
      const file = new File(["test"], "test.csv", { type: "text/csv" });
      const onProgress = jest.fn();

      uploadCsv(file, onProgress);

      xhrMock.upload.onprogress({
        lengthComputable: true,
        loaded: 50,
        total: 100,
      });

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it("should handle upload failure with error response", async () => {
      const file = new File(["test"], "test.csv", { type: "text/csv" });
      xhrMock.status = 400;
      xhrMock.response = "Invalid file";

      const promise = uploadCsv(file);
      xhrMock.onload();

      await expect(promise).rejects.toThrow();
    });

    it("should handle network error", async () => {
      const file = new File(["test"], "test.csv", { type: "text/csv" });
      const promise = uploadCsv(file);

      xhrMock.onerror();

      await expect(promise).rejects.toThrow();
    });

    it("should not call progress callback if lengthComputable is false", async () => {
      const file = new File(["test"], "test.csv", { type: "text/csv" });
      const onProgress = jest.fn();

      uploadCsv(file, onProgress);

      xhrMock.upload.onprogress({
        lengthComputable: false,
        loaded: 50,
        total: 100,
      });

      expect(onProgress).not.toHaveBeenCalled();
    });

    it("should append file to FormData", async () => {
      const file = new File(["test"], "test.csv", { type: "text/csv" });
      const formDataAppendSpy = jest.spyOn(FormData.prototype, "append");

      uploadCsv(file);

      expect(formDataAppendSpy).toHaveBeenCalledWith("file", file);
    });
  });

  describe("searchData", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it("should handle successful response", async () => {
      const mockResponse = {
        headers: ["name", "age"],
        totalCount: 1,
        dataEntries: [{ id: 1, data: { name: "John", age: "30" } }],
        page: 1,
        limit: 10,
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchData({});
      expect(result).toEqual(mockResponse);
    });

    it("should construct URL with all params", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ headers: [], totalCount: 0, dataEntries: [] }),
      });

      await searchData({
        term: "test",
        column: "name",
        exact: true,
        page: 2,
        limit: 20,
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/data/search?term=test&column=name&exact=true&page=2&limit=20`
      );
    });

    it("should skip undefined params", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ headers: [], totalCount: 0, dataEntries: [] }),
      });

      await searchData({ term: "test" });
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/data/search?term=test`
      );
    });

    it("should throw error on non-ok response", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(searchData({})).rejects.toThrow();
    });

    it("should throw error on network failure", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error("Network error"));
      await expect(searchData({})).rejects.toThrow();
    });
  });
});

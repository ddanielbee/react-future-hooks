import { renderHook, act } from "@testing-library/react-hooks";
import fetch from "jest-fetch-mock";
import { useDataPost } from "./useDataPost";
import { FetchResult, FetchResultState } from "../utils/types";

fetch.enableFetchMocks();

const successfulTypeGuard = (_: any): _ is object => true;

const failingTypeGuard = (_: any): _ is object => false;

const testLogger: Logger = {
  error: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
};

describe("useDataPost", () => {
  afterEach(() => {
    (testLogger.error as jest.Mock).mockClear();
  });

  it("should return a null value with a NotStarted state before fetching is triggered", () => {
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.NotStarted,
    };

    const {
      result: {
        current: [initialValue],
      },
    } = renderHook(() =>
      useDataPost(
        "test-url",
        successfulTypeGuard,
        successfulTypeGuard,
        testLogger
      )
    );

    expect(initialValue).toEqual(expectedResult);
  });

  it("should return a null value with a Rejected state and log the error reason if body cannot be encoded successfully", async () => {
    const expectedErrorMessage =
      'Could not encode body for fetch with url: test-url and body: {"anybody":"anybody"}';
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.Rejected,
      reason: expectedErrorMessage,
    };

    const { result, waitForNextUpdate } = renderHook(() =>
      useDataPost("test-url", failingTypeGuard, successfulTypeGuard, testLogger)
    );

    await act(async () => {
      result.current[1]({ anybody: "anybody" });
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
    expect(testLogger.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it("should return a null value with a Rejected state and log the error reason if fetching fails", async () => {
    fetch.mockRejectOnce(() => Promise.reject("Rejected Promise"));
    const expectedErrorMessage =
      "Fetch failed for request test-url with reason: Rejected Promise";
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.Rejected,
      reason: expectedErrorMessage,
    };

    const { result, waitForNextUpdate } = renderHook(() =>
      useDataPost(
        "test-url",
        successfulTypeGuard,
        successfulTypeGuard,
        testLogger
      )
    );

    await act(async () => {
      result.current[1]({ anybody: "anybody" });
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
    expect(testLogger.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it("should return a null value with a Rejected state and log the error reason if fetching fails", async () => {
    fetch.mockRejectOnce(() => Promise.reject("Rejected Promise"));
    const expectedErrorMessage =
      "Fetch failed for request test-url with reason: Rejected Promise";
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.Rejected,
      reason: expectedErrorMessage,
    };

    const { result, waitForNextUpdate } = renderHook(() =>
      useDataPost(
        "test-url",
        successfulTypeGuard,
        successfulTypeGuard,
        testLogger
      )
    );

    await act(async () => {
      result.current[1]({ anybody: "anybody" });
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
    expect(testLogger.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it("should return a null value with a Rejected state and log the error reason if getting the json data out of the response fails", async () => {
    fetch.mockResponseOnce(() => Promise.resolve("Resolved Promise"));
    const expectedErrorMessage =
      "Fetch failed for request test-url with reason: FetchError: invalid json response body at  reason: Unexpected token R in JSON at position 0";
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.Rejected,
      reason: expectedErrorMessage,
    };

    const { result, waitForNextUpdate } = renderHook(() =>
      useDataPost(
        "test-url",
        successfulTypeGuard,
        successfulTypeGuard,
        testLogger
      )
    );

    await act(async () => {
      result.current[1]({ anybody: "anybody" });
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
    expect(testLogger.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it("should return a null value with a Rejected state log the error reason if decoding the result data fails", async () => {
    fetch.mockResponseOnce(() =>
      Promise.resolve(JSON.stringify({ data: "Resolved Data" }))
    );
    const expectedErrorMessage = "Could not decode result for request test-url";
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.Rejected,
      reason: expectedErrorMessage,
    };

    const { result, waitForNextUpdate } = renderHook(() =>
      useDataPost("test-url", successfulTypeGuard, failingTypeGuard, testLogger)
    );

    await act(async () => {
      result.current[1]({ anybody: "anybody" });
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
    expect(testLogger.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it("should return response data with a Fulfilled state when request is successful", async () => {
    const responseData = { data: "Resolved Data" };
    fetch.mockResponseOnce(() => Promise.resolve(JSON.stringify(responseData)));
    const expectedResult: FetchResult<{}> = {
      value: responseData,
      state: FetchResultState.Fulfilled,
    };

    const { result, waitForNextUpdate } = renderHook(() =>
      useDataPost(
        "test-url",
        successfulTypeGuard,
        successfulTypeGuard,
        testLogger
      )
    );

    await act(async () => {
      result.current[1]({ anybody: "anybody" });
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
  });
});

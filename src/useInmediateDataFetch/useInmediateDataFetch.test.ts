import { renderHook, act } from "@testing-library/react-hooks";
import { useInmediateDataFetch } from "./useInmediateDataFetch";
import fetch from "jest-fetch-mock";
import { FetchResult, FetchResultState } from "../utils/types";

fetch.enableFetchMocks();

const successfulTypeGuard = (_: any): _ is object => true;

const failingTypeGuard = (_: any): _ is object => false;

const testLogger: Logger = {
  error: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
};

describe("useDataFetch", () => {
  afterEach(() => {
    (testLogger.error as jest.Mock).mockClear();
  });

  it("should return a null value with a Pending state before fetching has completed", () => {
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.Pending,
    };

    const {
      result: {
        current: [initialValue],
      },
    } = renderHook(() =>
      useInmediateDataFetch("test-url", successfulTypeGuard, testLogger)
    );

    expect(initialValue).toEqual(expectedResult);
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
      useInmediateDataFetch("test-url", successfulTypeGuard, testLogger)
    );

    await act(async () => {
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
      useInmediateDataFetch("test-url", successfulTypeGuard, testLogger)
    );

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
    expect(testLogger.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it("should return a null value with a Rejected state log the error reason if decoding the data fails", async () => {
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
      useInmediateDataFetch("test-url", failingTypeGuard, testLogger)
    );

    await act(async () => {
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
      useInmediateDataFetch("test-url", successfulTypeGuard, testLogger)
    );

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(expectedResult);
  });

  it("should set state to Refreshing when retry function is called", () => {
    const expectedResult: FetchResult<{}> = {
      value: null,
      state: FetchResultState.Refreshing,
    };

    const { result } = renderHook(() =>
      useInmediateDataFetch("test-url", successfulTypeGuard, testLogger)
    );

    act(result.current[1]);

    expect(result.current[0]).toEqual(expectedResult);
  });
});

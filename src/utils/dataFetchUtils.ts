import * as React from "react";
import { FetchResult, FetchResultState } from "./types";

const decodeAndSetNewValue = <ResultType extends object>(
  jsonResult: any,
  typeGuard: (obj: any) => obj is ResultType,
  setValue: React.Dispatch<React.SetStateAction<FetchResult<ResultType>>>,
  url: string,
  logger: Logger
) => {
  if (typeGuard(jsonResult)) {
    setValue({ value: jsonResult, state: FetchResultState.Fulfilled });
  } else {
    const errorMessage = `Could not decode result for request ${url}`;
    setValue({
      value: null,
      state: FetchResultState.Rejected,
      reason: errorMessage,
    });
    logger.error(errorMessage);
  }
};

export const setValueOnOk = async <ResultType extends object>(
  fetchResult: Response,
  typeGuard: (obj: any) => obj is ResultType,
  setValue: React.Dispatch<React.SetStateAction<FetchResult<ResultType>>>,
  url: string,
  logger: Logger
) => {
  if (fetchResult.ok) {
    const jsonResult = await fetchResult.json();
    decodeAndSetNewValue<ResultType>(
      jsonResult,
      typeGuard,
      setValue,
      url,
      logger
    );
  } else {
    const errorMessage = `Fetch failed for request ${url} with statusCode ${fetchResult.status} & statusText ${fetchResult.statusText}`;
    setValue({
      value: null,
      state: FetchResultState.Rejected,
      reason: errorMessage,
    });
    logger.error(errorMessage);
  }
};

export const executeFetch = async <ResultType extends object>(
  url: string,
  setValue: React.Dispatch<React.SetStateAction<FetchResult<ResultType>>>,
  typeGuard: (obj: any) => obj is ResultType,
  logger: Logger
) => {
  try {
    const fetchResult = await fetch(url);
    await setValueOnOk<ResultType>(
      fetchResult,
      typeGuard,
      setValue,
      url,
      logger
    );
  } catch (reason) {
    const errorMessage = `Fetch failed for request ${url} with reason: ${reason}`;
    setValue({
      value: null,
      state: FetchResultState.Rejected,
      reason: errorMessage,
    });
    logger.error(errorMessage);
  }
};

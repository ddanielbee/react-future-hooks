import * as React from "react";
import { setValueOnOk } from "../utils/dataFetchUtils";
import { FetchResult, FetchResultState } from "../utils/types";

export type UseDataPost = <BodyType extends object, ResultType extends object>(
  url: string,
  bodyTypeGuard: (obj: any) => obj is BodyType,
  resultTypeGuard: (obj: any) => obj is ResultType,
  logger: Logger
) => [FetchResult<ResultType>, (body: BodyType) => void];

const executePostFetch = async <BodyType, ResultType extends object>(
  url: string,
  body: BodyType,
  setValue: React.Dispatch<React.SetStateAction<FetchResult<ResultType>>>,
  resultTypeGuard: (obj: any) => obj is ResultType,
  logger: Logger
) => {
  try {
    const fetchResult = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    await setValueOnOk<ResultType>(
      fetchResult,
      resultTypeGuard,
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

export const useDataPost = <BodyType extends object, ResultType extends object>(
  url: string,
  bodyTypeGuard: (obj: any) => obj is BodyType,
  resultTypeGuard: (obj: any) => obj is ResultType,
  logger: Logger
): [FetchResult<ResultType>, (body: BodyType) => void] => {
  const [resultValue, setResultValue] = React.useState<FetchResult<ResultType>>(
    {
      value: null,
      state: FetchResultState.NotStarted,
    }
  );

  const executeRequest = React.useMemo(
    () => (body: BodyType) => {
      if (bodyTypeGuard(body)) {
        setResultValue({ value: null, state: FetchResultState.Pending });
        executePostFetch(url, body, setResultValue, resultTypeGuard, logger);
      } else {
        const errorMessage = `Could not encode body for fetch with url: ${url} and body: ${JSON.stringify(
          body
        )}`;
        setResultValue({
          value: null,
          state: FetchResultState.Rejected,
          reason: errorMessage,
        });
        logger.error(errorMessage);
      }
    },
    [url, resultTypeGuard, bodyTypeGuard]
  );

  return [resultValue, executeRequest];
};

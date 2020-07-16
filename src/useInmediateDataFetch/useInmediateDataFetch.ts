import * as React from "react";
import { executeFetch } from "../utils/dataFetchUtils";
import { FetchResult, FetchResultState } from "../utils/types";

export type UseDataFetch = <ResultType extends object>(
  url: string,
  typeGuard: (obj: any) => obj is ResultType,
  logger: Logger
) => [FetchResult<ResultType>, () => void];

export const useInmediateDataFetch = <ResultType extends object>(
  url: string,
  typeGuard: (obj: any) => obj is ResultType,
  logger: Logger
): [FetchResult<ResultType>, () => void] => {
  const [resultValue, setResultValue] = React.useState<FetchResult<ResultType>>(
    {
      value: null,
      state: FetchResultState.Pending,
    }
  );

  const retryFetch = React.useMemo(
    () => () => {
      setResultValue({
        value: resultValue.value,
        state: FetchResultState.Refreshing,
      });
      executeFetch(url, setResultValue, typeGuard, logger);
    },
    [url, typeGuard]
  );

  React.useEffect(() => {
    executeFetch(url, setResultValue, typeGuard, logger);
  }, [url, typeGuard]);

  return [resultValue, retryFetch];
};

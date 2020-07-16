import * as React from "react";
import { executeFetch } from "../utils/dataFetchUtils";
import { FetchResult, FetchResultState } from "../utils/types";

export type UseDataFetch = <ResultType extends object>(
  typeGuard: (obj: any) => obj is ResultType,
  logger: Logger
) => [FetchResult<ResultType>, (url: string) => void];

export const useDataFetch = <ResultType extends object>(
  typeGuard: (obj: any) => obj is ResultType,
  logger: Logger
): [FetchResult<ResultType>, (url: string) => void] => {
  const [resultValue, setResultValue] = React.useState<FetchResult<ResultType>>(
    {
      value: null,
      state: FetchResultState.NotStarted,
    }
  );

  const doFetch = React.useMemo(
    () => (url: string) => {
      if (resultValue.state !== FetchResultState.NotStarted) {
        console.log("this should've happened");
        setResultValue({
          value: resultValue.value,
          state: FetchResultState.Refreshing,
        });
      } else {
        setResultValue({
          value: null,
          state: FetchResultState.Pending,
        });
      }
      executeFetch(url, setResultValue, typeGuard, logger);
    },
    [typeGuard]
  );

  return [resultValue, doFetch];
};

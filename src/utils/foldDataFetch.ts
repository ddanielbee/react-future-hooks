import { FetchResult, FetchResultState } from "./types";

export const foldDataFetch = <ResultType, ReturnType>(
  dataFetch: FetchResult<ResultType>
) => (
  notStarted: ReturnType,
  pending: ReturnType,
  refreshing: ReturnType,
  fulfilled: (value: ResultType) => ReturnType,
  rejected: (reason?: string) => ReturnType,
  other: ReturnType
) => {
  switch (dataFetch.state) {
    case FetchResultState.NotStarted:
      return notStarted;
    case FetchResultState.Pending:
      return pending;
    case FetchResultState.Refreshing:
      return refreshing;
    case FetchResultState.Fulfilled:
      if (dataFetch.value) {
        return fulfilled(dataFetch.value);
      }
      return rejected("Value is null");
    case FetchResultState.Rejected:
      return rejected(dataFetch.reason);
    default:
      return other;
  }
};

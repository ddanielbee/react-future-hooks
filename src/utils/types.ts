export enum FetchResultState {
  NotStarted = "NotStarted",
  Pending = "Pending",
  Refreshing = "Refreshing",
  Fulfilled = "Fulfilled",
  Rejected = "Rejected",
}

export interface FetchResult<ResultType> {
  value: ResultType | null;
  state: FetchResultState;
  reason?: string;
}

# Hooks for the future

A couple of utility hooks for perfoming declarative async operations inside React Components.

## Motivation

React isn't entirely great at handling async operations. Even with Suspense, its rendering model doesn't fulfill all the stages of rendering UI when Async Operations are concerned.

Future Hooks give you a lightweight interface to handle such operations. It's based on the premise that an async operation can be in only one of 5 states at a time and your UI needs to be able to reflect this states (or most of them at least).

## Installation

`react-future-hooks` is an npm package. Install it with either `npm` or `yarn`:

`npm install react-future-hooks`

`yarn add react-future-hooks`

## Usage

The package exposes 3 hooks, and one utility function to render the results of the async operations.

All 3 hooks take similar arguments:

- `url`: Your endpoint url, where fetching can happen.
- `typeguard`: A function that will take the result of fetching, and should return a boolean value. Intended to make sure your result is what you expect it to be.
- `logger`: An object with info, log and error functions. Console works fine for the browser, but if you have something more specific here's where you would use it.

### useInmediateDataFetch

Fires a `GET` request eagerly to the given url.

```javascript
import * as React from "react";
import { useInmediateDataFetch } from "react-future-hooks";

// We'll fetch the User's data using an userId prop and our useInmediateDataFetch hook
const User = (props) => {
  /* 
    userFetchResult has this shape: 
    { state: FetchResultState, value: ResultType, reason?: string }
    Below you'll find more info on the possible FetchResultState values
  */

  const [userFetchResult, refreshUserFetch] = useInmediateDataFetch(
    `/user-api/${props.userId}`,
    typeguard,
    logger
  );

  switch (userFetchResult.state) {
    case "Pending":
      return <LoadingSpinner />;
    case "Fulfilled":
      return (
        <UserAvatar
          name={userFetchResult.value.name}
          picture={userFetchResult.value.picture}
        />
      );
    case "Rejected":
      return <ErrorMessage msg={userFetchResult.reason} />;
    default:
      return <DefaultFallback />;
  }
};
```

In this example, we define what will be rendered based on the state of our fetch request. We use 3 of the possible 5 [FetchResultStates](#FetchResultState). Please refer to that section for more information.

### useDataFetch

Fires a `GET` request lazily to the given url.

```javascript
import * as React from "react";
import { useDataFetch } from "react-future-hooks";

/* 
  This time, we don't have access to userId on first render, but we'll fetch it somehow. 
  How that happens is not relevant to the example.
*/
const User = () => {
  // userFetchResult will start with a state of "NotStarted" this time.
  const [userFetchResult, executeUserFetch] = useDataFetch(typeguard, logger);
  /* 
    This function might do a myriad of things, but the important part is that 
    userId is not there at initial render.
  */
  const userId = getUserIdEventually();

  React.useEffect(() => {
    if (userId) {
      executeUserFetch(`/user-api/${userId}`);
    }
  }, [userId]); // Once userId is there, fire the fetch request

  switch (userFetchResult.state) {
    case "NotStarted":
      return <InitialRendering />;
    case "Pending":
      return <LoadingSpinner />;
    case "Fulfilled":
      return (
        <UserAvatar
          name={userFetchResult.value.name}
          picture={userFetchResult.value.picture}
        />
      );
    case "Rejected":
      return <ErrorMessage msg={userFetchResult.reason} />;
    default:
      return <DefaultFallback />;
  }
};
```

The difference between the 2 examples above, is that we don't have access to `userId` initially. There are a lot of reasons why this might be so, and in that case you have to defer the fetch request until a point in time when you're sure you have all the data necessary for building the `GET` url, as we see here.

### useDataPost

Fires a `POST` request to the given url with the given body lazily.

```javascript
import * as React from "react";
import { useDataPost } from "react-future-hooks";

const UpdateUser = (props) => {

  // userUpdateResult will start with a state of NotStarted.
  const [userUpdateResult, executeUserUpdate] = useDataPost(
    `/user-api/update/${props.userId}`
    requestBodyTypeGuard, // We need 2 typeguards for this one.
    /*
      // There are cases we might not care about the result.
      We can always pass () => true;
      for a typeguard that never fails in those cases.
    */
    resultTypeGuard,
    logger
  );

  const handleFormSubmit = (userData) => {
    /*
      We execute the POST request with the body we want to send to the endpoint.
      This will trigger the same state changes on userUpdateResult as the other hooks.
    */
    executeUserUpdate(userData)
  }

  switch (userFetchResult.state) {
    case "NotStarted":
    /*
      Not in the example, what UpdateForm does, but it's assumed that
      when submitted it will call it's onSubmit with the data we want to send.
    */
      return <UpdateForm onSubmit={handleFormSubmit} />;
    case "Pending":
      return <LoadingSpinner />;
    case "Fulfilled":
      return (
        <p>User Data Updated Successfully!</p>
      );
    case "Rejected":
      return <ErrorMessage msg={userFetchResult.reason} />;
    default:
      return <DefaultFallback />;
  }
};
```

For this example we're not fetching data anymore, but we're sending data through a `POST` request. The url and typeguards are set initially, and we're given access to the usual result object and a function to execute the request with the `BODY` as an argument.

### TypeGuards

In async operations we can never be sure of what we'll get. That's why we protect our components with a TypeGuard function, which will guarantee that once the data is accessible in the component, it has the shape we expected it to have. An example of this function could look like this: `

```javascript
/* 
  We check if an object passed is of type UserData, 
  where UserData looks like: { name: string, age: number }
*/
const isUserData = (obj) =>
  typeof obj === "object" &&
  typeof obj.name === "string" &&
  typeof obj.number === "number";
```

### foldDataFetch

Because the pattern for rendering seen above is so common, the library provides utility function that abstracts it called `foldDataFetch`. This function initially takes an object of the `FetchResult { state: FetchResultState, value: ResultType, reason?: string }` shape and returns a function that expects 6 different arguments, each one representing one of the possible states the FetchResult can be in.

- `notStarted` => This will be returned directly when the state is `NotStarted`.
- `pending` => This will be returned directly when the state is `Pending`.
- `refreshing` => This will be returned directly when the state is `Refreshing`.
- `fulfilled` => This argument should be a function that will take the
  value of the fetching operation. When the state is `Fulfilled`, `foldDataFetch` will return the result of applying this function to the result's value.
- `rejected` => This argument should be a function that will take the reson for the failure of the fetching operation. When the state is `Rejected`, `foldDataFetch` will return the result of applying this function to the result's reason. **Note**: fetchResult will only have a reason when the state is `Rejected`. Otherwise, it will remain undefined.
- `other` => Any unexpected case will land here. This will be returned directly in such cases.

### FetchResultState

There are 5 possible states your async operation can be in at any point in time. Each operation will only be in one single state at any given moment. Here are the 5 cases as the exported Typescript enum:

```typescript
export enum FetchResultState {
  // Present in useDataPost and useDataFetch. State before the request has been fired.
  NotStarted = "NotStarted",
  // State after the request has been fired but before it has been fulfilled or rejected.
  Pending = "Pending",
  /* 
    State when a request is fired again once it's been fulfilled 
    or rejected and before it finishes again.
  */
  Refreshing = "Refreshing",
  // State when a request is fulfilled successfully.
  Fulfilled = "Fulfilled",
  // State when a request is rejected due to an error.
  Rejected = "Rejected",
}
```

### Rejections

There are 3 types of rejections handled by all hooks:

- **Request Fails**: Fetch call fails for any reason.
- **Result cannot be decoded**: A call to `fetch().json()` fails for any reason (usually because result is either, not JSON or has invalid JSON syntax).
- **Typeguard fails**: When the function passed as a typeguard does not return true on execution, this rejection happens. It protects the component from getting unexpected and thus failing to render correctly.

## Typescript

This library is written entirely in Typescript. Here is the TS version of the first example.

### useInmediateDataFetch

Fires a `GET` request eagerly to the given url.

```javascript
import * as React from "react";
import { useInmediateDataFetch, FetchResultState } from "react-future-hooks";

const User = (props: { userId: string }) => {
  const [userFetchResult, refreshUserFetch] = useInmediateDataFetch(
    `/user-api/${props.userId}`,
    typeguard,
    logger
  );

  switch (userFetchResult.state) {
    case FetchResultState.Pending:
      return <LoadingSpinner />;
    case FetchResultState.Fulfilled:
      return (
        <UserAvatar
          name={userFetchResult.value.name}
          picture={userFetchResult.value.picture}
        />
      );
    case FetchResultState.Rejected:
      return <ErrorMessage msg={userFetchResult.reason} />;
    default:
      return <DefaultFallback />;
  }
};
```

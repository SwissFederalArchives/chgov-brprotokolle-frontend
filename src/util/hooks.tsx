import {
  useCallback,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import qs from 'qs';

export function useQueryState<T = string>(
  name: string,
  initialValue: T | null,
  parse: (value: string) => T = (value) => value as T,
  format: (value: T) => string = (value) =>
    value as unknown as string
): [T, Dispatch<SetStateAction<T | null>>] {
  const location = useLocation();
  const history = useHistory();

  const setQuery = useCallback<Dispatch<SetStateAction<T | null>>>(
    (value: T | ((prevState: T | null) => T | null) | null) => {
      const newValue =
        typeof value === 'function' ? (value as Function)(initialValue) : value;
      const currentUrl = new URL(window.location.href);
      const existingQueries: any = qs.parse(currentUrl.search, {
        ignoreQueryPrefix: true,
      });

      if (newValue === null || newValue === undefined) {
        delete existingQueries[name];
      } else {
        existingQueries[name] = format(newValue);
      }

      const queryString = qs.stringify(existingQueries, {
        skipNulls: true,
        encode: false,
      });

      history.push(`${location.pathname}?${queryString}`);
    },
    [history, location, name, format, initialValue]
  );

  const currentValue =
    qs.parse(location.search, { ignoreQueryPrefix: true })[name] ||
    initialValue;

  return [parse(String(currentValue !== null ? currentValue : '')), setQuery];
}

export function usePrevious<T>(value: T): T {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref: any = useRef<T>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

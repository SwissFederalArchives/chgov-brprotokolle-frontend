import { useCallback, useRef, useEffect, Dispatch, SetStateAction } from "react"
import { useHistory, useLocation } from "react-router-dom"

import qs from "qs"

export function useQueryState(name: string, initialValue: string | null = null): [string, Dispatch<SetStateAction<string | null>>] {
    const location = useLocation()
    const history = useHistory()

    const setQuery = useCallback(
        value => {
            const currentUrl = new URL(window.location.href);
            const existingQueries = qs.parse(currentUrl.search, {
                ignoreQueryPrefix: true,
            })

            const queryString = qs.stringify(
                { ...existingQueries, [name]: value },
                { skipNulls: true, encode: false },
            )
            history.push(`${location.pathname}?${queryString}`)
        },
        [history, location, name]
    )

    return [
        String(qs.parse(location.search, { ignoreQueryPrefix: true })[name] || initialValue),
        setQuery,
    ]
};

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
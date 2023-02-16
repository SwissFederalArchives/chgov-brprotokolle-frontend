export const replaceSearchParameters = (searchParams: { [key: string]: string | number | boolean | null | undefined }, returnSearchOnly: boolean = true, url: string = window.location.href): string => {
    const urlObject = new URL(url);
    Object.entries(searchParams).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            urlObject.searchParams.delete(key);
        } else {
            urlObject.searchParams.set(key, value.toString());
        }
    });
    return returnSearchOnly ? urlObject.search : urlObject.toString();
}
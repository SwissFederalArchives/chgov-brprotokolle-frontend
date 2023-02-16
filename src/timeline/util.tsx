import moment from 'moment';
import IManifestData, { IManifestReference } from "../interface/IManifestData";
import ITimelineData from '../interface/ITimelineData';
import PresentationApi from "../fetch/PresentationApi";


export const buildManifest = (manifest: IManifestData | undefined) => {
    let collections: IManifestReference[] | undefined = manifest?.collections;
    let yearsManifest: ITimelineData = {};

    if (collections) {
        collections.map((manifest: IManifestReference) => {
            if (!manifest.navDate) return null;

            const date = moment(manifest.navDate);
            const year = date.year().toString();


            yearsManifest = {
                ...yearsManifest,
                [year]: {
                    id: manifest.id,
                    months: (yearsManifest && yearsManifest[year]) || null
                }
            };

            return null;
        });
    }

    return yearsManifest;
};

export const fetchYearsByRange = (manifest: ITimelineData | undefined, filterRange: number[]) => (
    // Returns a promise, as there are async operations running
    new Promise<ITimelineData | undefined>((globalResolve) => {
        let newManifest = { ...manifest };
        const [minY, maxY] = filterRange;
        // Creates an Array of all years in the given range
        const filterRangeYears = Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i);

        // Creates an array of promises for each year in filterRangeYears
        Promise.all(filterRangeYears.map((y) => (
            new Promise<{ year: string, collections: IManifestReference[] | undefined }>((resolve) => {
                const year = y.toString();
                if (manifest && manifest[year]) {
                    if (!manifest[year].months) {
                        // Fetching corresponding year manifest defined in 'id' field of an year collection-item, but only if it hasn't been fetched yet.
                        PresentationApi.get(manifest[year].id).then((fetchedManifest: IManifestData) => {
                            const { collections } = fetchedManifest;
                            if (collections) {
                                // Resolving the promise by returning current 'year' and fetched 'collections'
                                resolve({ year, collections })
                            } else {
                                // We need Promise.all to resolve all our promises. Therefore we resolve with collections=undefined
                                resolve({year, collections: undefined});
                            }
                        });
                    } else {
                        // We need Promise.all to resolve all our promises. Therefore we resolve with collections=undefined
                        resolve({year, collections: undefined});
                    }
                } else {
                    // We need Promise.all to resolve all our promises. Therefore we resolve with collections=undefined
                    resolve({year, collections: undefined});
                }
            })
        )))
        // This callback-function is resolved once ALL promises have been resolved. The results array contains the return value of each resolved promise.
        .then((results) => {
            results.map(({ year, collections }) => {
                let months: ITimelineData = {};
                // If new collections were found for the given year...
                if (collections) {
                    collections.map((collection) => {
                        if (!collection.navDate) return null;
                        const date = moment(collection.navDate);
                        const month = date.month().toString();
                        months[month] = {
                            id: collection.id,
                            items: null
                        };
                        return null;
                    })
                    // ... fill the collections into the new manifest
                    newManifest = {
                        ...newManifest,
                        [year]: {
                            ...newManifest[year],
                            months: newManifest[year].months || months
                        }
                    };
                }
                return null;
            })
            // We are returning the new manifest as a result of our promise
            globalResolve(newManifest);
        })
    })
);


export const fetchMonth = (manifest: ITimelineData | undefined, year: string, month: string) => (
    // Returns a promise, as there are async operations running
    new Promise<ITimelineData | undefined>((resolve, reject) => {
        if (manifest && manifest[year]) {
            if (manifest[year]?.months[month] && !manifest[year].months[month]?.items) {
                // Fetching corresponding year manifest defined in 'id' field of an year collection-item, but only if it hasn't been fetched yet.
                PresentationApi.get(manifest[year].months[month].id).then((fetchedManifest: IManifestData) => {
                    let newManifest = {...manifest};
                    const { manifests } = fetchedManifest;
                    let items = manifests;
                    // Resolving the promise by returning current 'year' and fetched 'collections'
                    if (manifests) {
                        // ... fill the collections into the new manifest
                        newManifest = {
                            ...newManifest,
                            [year]: {
                                ...newManifest[year],
                                months: {
                                    ...((newManifest && newManifest[year] && newManifest[year].months) || {}),
                                    [month]: {
                                        ...((newManifest && newManifest[year] && newManifest[year].months && newManifest[year].months[month]) || {}),
                                        items
                                    }
                                }
                            }
                        };
                        resolve(newManifest);
                    } else {
                        // We need Promise.all to resolve all our promises. Therefore we resolve with collections=undefined
                        reject();
                    }
                });
            } else {
                // We need Promise.all to resolve all our promises. Therefore we resolve with collections=undefined
                reject();
            }
        } else {
            // We need Promise.all to resolve all our promises. Therefore we resolve with collections=undefined
            reject();
        }
    })
);

export const filterManifestsByDateRange = (groupedManifests: ITimelineData | undefined, minYear: number, maxYear: number): ITimelineData|undefined => {
    let filteredManifests: ITimelineData | undefined = undefined;

    if (groupedManifests) {
        Object.keys(groupedManifests).map((yearString: string) => {
            const year: number = parseInt(yearString);

            if (year >= minYear && year <= maxYear) {
                filteredManifests = filteredManifests || {};
                filteredManifests[year] = groupedManifests[year];
            }

            return null;
        });
    }

    return filteredManifests;
}

export const getRelevantRenderingItems = (allRenderingItems: any, language: string, excludeIndexes = [0,1]) => {
    return allRenderingItems
        .filter((rendering: any, index: number) => !excludeIndexes.includes(index))
        .filter((rendering: any) => rendering?.language?.includes(language));
}
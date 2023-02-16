import { IManifestReference } from "./IManifestData";

export default interface ITimelineData {
    [key: number]: {
        id: string;
        months: null|{
            [key: number]: {
                id: string,
                items: IManifestReference[]|null
            }
        }
    }
}

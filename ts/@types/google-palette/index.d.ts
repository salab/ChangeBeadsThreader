declare module "google-palette" {
    type RGBString = string

    // tslint:disable-next-line:only-arrow-functions
    export default function palette(name: string, size: number): RGBString[]
}

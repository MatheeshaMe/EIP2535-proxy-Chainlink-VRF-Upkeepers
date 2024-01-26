import * as fs from "fs"

export const readFileSync = async<T>(filePath:string): Promise<T> =>{
    return JSON.parse(fs.readFileSync(filePath).toString('utf-8')) as T
}

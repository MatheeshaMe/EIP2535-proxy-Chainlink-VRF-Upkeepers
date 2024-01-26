import * as fs from "fs"

export const writeFileSync = async (filePath: string, data: any, isStringified: boolean) => {
    if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "", "utf-8")
    }
    try {
        fs.writeFileSync(filePath, !isStringified ? JSON.stringify(data) : data, "utf-8")
        return !isStringified ? JSON.stringify(data) : data
    } catch (error) {
        throw error
    }
}


import { readFileSync, writeFileSync, existsSync } from "fs";

export class ServerConfig {
    private filePath: string;

    private defaultValues = {
        'rankRoles': {},
        'rankLinkingEnabled': false
    };

    /**
     * Discord role ID's of each minecraft rank
     */
    public rankRoles: {[ccId: string]: string};

    /**
     * Whether a server has rankLinkingEnabled
     */
    public rankLinkingEnabled: boolean;

    constructor(path: string, serverId: string) {
        this.filePath = `${path}/${serverId}`;

        this.loadData(this.filePath);
    }

    private loadData(filePath: string): void {
        const data = existsSync(filePath) ? JSON.parse(String(readFileSync(filePath))) : this.defaultValues;

        for (let i in this.defaultValues) {
            if (!data[i]) {
                data[i] = this.defaultValues[i];
            }
        }

        for (let i in data) {
            if (this[i] === undefined) {
                this[i] = data[i];
            }
        }
    }

    public async saveData(filePath: string = this.filePath): Promise<void> {
        const data = {};

        data['rankRoles'] = this.rankRoles;
        data['rankLinkingEnabled'] = this.rankLinkingEnabled;

        writeFileSync(filePath, JSON.stringify(data));
    }
}
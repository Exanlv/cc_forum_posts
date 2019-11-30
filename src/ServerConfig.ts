import { existsSync, readFileSync, writeFileSync } from 'fs';

export class ServerConfig {

	/**
     * Discord role ID's of each minecraft rank
     */
	public rankRoles: {[ccId: string]: string};

	/**
     * Whether a server has rankLinkingEnabled
     */
	public rankLinkingEnabled: boolean;
	private filePath: string;

	private defaultValues: {[key: string]: any} = {
		rankRoles: {},
		rankLinkingEnabled: false,
	};

	constructor(path: string, serverId: string) {
		this.filePath = `${path}/${serverId}`;

		this.loadData(this.filePath);
	}

	public async saveData(filePath: string = this.filePath): Promise<void> {
		const data = {};

		data['rankRoles'] = this.rankRoles;
		data['rankLinkingEnabled'] = this.rankLinkingEnabled;

		writeFileSync(filePath, JSON.stringify(data));
	}

	private loadData(filePath: string): void {
		const data = existsSync(filePath) ? JSON.parse(String(readFileSync(filePath))) : this.defaultValues;

		for (const i in this.defaultValues) {
			if (!data[i]) {
				data[i] = this.defaultValues[i];
			}
		}

		for (const i in data) {
			if (this[i] === undefined) {
				this[i] = data[i];
			}
		}
	}
}

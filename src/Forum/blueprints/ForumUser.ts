import { unlink } from 'fs';
import { image as downloadImage } from 'image-downloader';
import * as imgur from 'imgur-v2';
import { CubecraftForum } from '../CubecraftForum';

export class ForumUser {

	public userId: string;
	public username: string;
	public avatar: string;
	public roles: string[];
	public status?: string;
	private cubecraftForum: CubecraftForum;
	private imgur: any;

	private mcUuid: string;

	constructor(userId: string, cubecraftForum: CubecraftForum) {
		this.userId = userId;
		this.cubecraftForum = cubecraftForum;

		this.imgur = imgur;
		this.imgur.setClientId(process.env.IMGUR_CLIENT_ID);
	}

	public async loadData(): Promise<void> {
		const page = await this.cubecraftForum.browser.newPage();
		await page.goto(`${this.cubecraftForum.baseUrl}/members/${this.userId}`);

		const {username, roles, avatar, mcUuid} = await page.evaluate(() => {
			return {
				username: document.getElementsByClassName('username')[0].innerHTML.trim().match(/^(.*)/)[0],
				roles: ((): string[] => {
					/**
                     * Roles like "Staff Member" and "Moderator"
                     */
					const userBannerElement = document.getElementsByClassName('userBanners')[0];

					if (!userBannerElement) {
						return [];
					}

					return Array.from(userBannerElement.children).map((el: HTMLElement) => el.innerHTML.match(/<strong>(.*)<\/strong>/)[1]);
				})(),
				avatar: document.getElementsByClassName('avatarScaler')[0].innerHTML.trim().replace(/\n/g, '').match(/<img src=\"(.*)\" alt/)[1],
				mcUuid: ((): string => {
					/**
                     * UUID of user is in the URL of the head avatar displayed next to the minecraft username
                     */
					const mcPlayerProfile = document.getElementsByClassName('playerAvatar')[0];

					if (!mcPlayerProfile) {
						return null;
					}

					return mcPlayerProfile.innerHTML.trim().match(/user=(.*)\" height/)[1];
				})(),
			};
		});

		page.close();

		/**
         * Cubecraft has some sort of protection so images cant be loaded in discord,
         * Uploading from URL to imgur had issues with file type, temp download files
         * upload them to imgur as file then delete them
         */
		const tempFilePath = `${__dirname}/../temp-avatars/${this.userId}.png`;

		await downloadImage({
			url: avatar,
			dest: tempFilePath,
		});

		this.avatar = (await this.imgur.uploadFile(tempFilePath)).data.link;

		this.username = username;
		this.roles = roles;

		this.mcUuid = mcUuid;

		unlink(tempFilePath, () => { return; });
	}
}

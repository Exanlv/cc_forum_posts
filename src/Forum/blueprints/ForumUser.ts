import { unlink } from 'fs';
import { image as downloadImage } from 'image-downloader';
import * as imgur from 'imgur-v2';
import { CubecraftForum } from '../CubecraftForum';
import { AdditionalUserInfo } from './AdditionalUserInfo';

export class ForumUser {

	public userId: string;
	public username: string;
	public avatar: string;
	public roles: string[];
	public status?: string;
	public additionalUserInfo: AdditionalUserInfo;
	public url: string;

	private imgur: any;

	private mcUuid: string;

	constructor(userId: string) {
		this.userId = userId;

		this.imgur = imgur;
		this.imgur.setClientId(process.env.IMGUR_CLIENT_ID);
	}

	public async loadData(cubecraftForum: CubecraftForum): Promise<void> {
		const page = await cubecraftForum.browser.newPage();
		await page.goto(`${cubecraftForum.baseUrl}/members/${this.userId}`);

		const {username, roles, avatar, mcUuid, status, additionalUserInfo, url} = await page.evaluate(() => {
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
				status: ((): string => {
					const statusElement = document.getElementById('UserStatus');
					
					if (!statusElement) {
						return null;
					}

					statusElement.getElementsByClassName('DateTime')[0].remove();

					return statusElement.textContent;
				})(),
				additionalUserInfo: ((): {[property: string]: string} => {
					/**
					 * The mc account display uses the same class as user info
					 */
					let mcAccount = document.getElementsByClassName('mcPlayerProfile')[0];

					if (mcAccount) {
						mcAccount.parentElement.remove();
					}

					let elements = Array.from(document.getElementsByClassName('mast')[0].getElementsByClassName('pairsJustified'));
					let res = {};

					elements.forEach((childElement) => {
						Array.from(childElement.children).forEach((dlElement) => {
							/**
							 * Calculate message/likes ratio, calculated here for the display order
							 */
							if (res['likes_received'] && res['messages']) {
								res['likes/message_ratio'] = (res['likes_received'].replace(/,/g, '') / res['messages'].replace(/,/g, '')).toFixed(2);
							}

							res[dlElement.children[0].textContent.replace(/ /g, '_').replace(/:/g, '').toLowerCase()] = dlElement.children[1].textContent;
						})
					});

					return res;
				})(),
				url: window.location.href
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
		this.status = status;
		this.additionalUserInfo = additionalUserInfo;
		
		this.url = url;

		this.mcUuid = mcUuid;


		unlink(tempFilePath, () => { return; });
	}
}

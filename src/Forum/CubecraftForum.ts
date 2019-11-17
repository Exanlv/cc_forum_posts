import { EventEmitter } from 'events';
import { launch } from 'puppeteer';
import { DirectMessage } from './blueprints/DirectMessage';
import { ForumUser } from './blueprints/ForumUser';
import { NewForumPost } from './blueprints/NewForumPost';

import * as fetch from 'node-fetch';

export class CubecraftForum extends EventEmitter {
	public browser: any;
	public baseUrl: string = 'https://www.cubecraft.net';

	private username: string;
	private password: string;

	private refreshTimer: number;

	private forumUsers: {[id: string]: ForumUser} = {};

	constructor(refreshTimer: number, username: string, password: string) {
		super();

		this.username = username;
		this.password = password;

		this.refreshTimer = refreshTimer;
	}

	public async startUp(): Promise<void> {
		this.browser = await launch({headless: process.env.DEV === 'false'});

		const page = await this.browser.newPage();
		await page.goto(this.baseUrl);

		/**
         * Open the login overlay so page.type doesnt fart
         */
		await page.evaluate(() => {
			(document.getElementsByClassName('loginText')[0] as HTMLElement).click();
		});

		/**
         * Enter login details
         */
		await page.type('input[name=login]', this.username);
		await page.type('input[name=password]', this.password);

		/**
         * Check the "stay logged in" checkbox, press "login"
         */
		await page.evaluate(() => {
			(document.getElementById('ctrl_remember') as HTMLElement).click();
			(document.querySelector('.primary[type=submit]') as HTMLElement).click();
		});

		/**
         * Wait for login to complete
         */
		await page.waitForSelector('.accountUsername');

		page.close();

		this.emit('ready');

		/**
         * Interval for checking forum updates
         */
		setInterval(() => {
			this.handleDms();
		}, this.refreshTimer);
	}

	public async getUserInfo(id: string, forceRenew: boolean = false): Promise<ForumUser> {
		if (this.forumUsers[id] && !forceRenew) {
			return this.forumUsers[id];
		}

		const user = new ForumUser(id);
		await user.loadData(this);

		this.forumUsers[id] = user;

		return user;
	}

	public async searchMembers(username: string): Promise<string[]> {
		const page = await this.browser.newPage();
		await page.goto(`${this.baseUrl}/members/`);

		await page.type('input[name=username]', username);

		await page.waitFor('.autoCompleteList');

		const result = await page.evaluate(() => {
			return Array.from(document.getElementsByClassName('autoCompleteList')[0].children).map((liElement: HTMLElement) => {
				return {username: liElement.textContent, id: liElement.innerHTML.match(/src="data\/avatars\/(.*)\/(.*)\/(.*).jpg/)};
			});
		});

		page.close();

		return result;
	}

	public async getUserIdByUsername(username: string): Promise<string> {
		const page = await this.browser.newPage();
		await page.goto(`${this.baseUrl}/members/`);

		await page.type('input[name=username]', username);

		await page.waitForSelector('.autoCompleteList');

		/**
		 * User ID isnt consistently available in the search result so
		 * you have to visit the users profile to get it instead
		 */
		const hasResult = await page.evaluate(() => {
			const username = (document.querySelector('input[name=username]') as HTMLInputElement).value;
			const elements = Array.from(document.getElementsByClassName('autoCompleteList')[0].children) as HTMLElement[];

			for (const i in elements) {
				if (elements[i].textContent === username) {
					elements[i].click();
					return true;
				}
			}

			return false;
		});

		/**
		 * Its possible the username isnt found
		 */
		if (!hasResult) {
			page.close();
			return;
		}

		await page.waitForSelector('h1.username');

		const userId = await page.evaluate(() => {
			return window.location.href.match(/\/members\/(.*)\.(.*)\//)[2];
		});

		page.close();

		return userId;
	}

	private async handleDms(): Promise<void> {
		if (!(await this.hasDms)) {
			return;
		}

		const page = await this.browser.newPage();
		await page.goto(`${this.baseUrl}/conversations`);

		/**
         * Get an array of every unread DM id, mark all as read
         */
		const dms: string[] = await page.evaluate(() => {
			const unread = Array.from(document.getElementsByClassName('unread')) as HTMLElement[];
			const dms = [];

			for (const i in unread) {
				dms.push(unread[i].id.split('-')[1]);
			}

			const readToggle = Array.from(document.getElementsByClassName('ReadToggle')) as HTMLLinkElement[];

			for (const i in readToggle) {
				if (readToggle[i].title.toLowerCase() === 'mark as read') {
					readToggle[i].click();
				}
			}

			return dms;
		});

		/**
         * Handle each dm individually
         */
		for (const i in dms) {
			this.handleDm(dms[i]);
		}

		page.close();
	}

	private async handleDm(dmId: string): Promise<void> {
		const page = await this.browser.newPage();
		await page.goto(`${this.baseUrl}/conversations/${dmId}`);

		/**
         * If the dm has multiple pages, navigate to the last page
         */
		const lastPage = await page.evaluate(() => {
			const nav = document.getElementsByClassName('PageNav')[0];

			if (nav) {
				return nav.getAttribute('data-range');
			}
		});

		if (lastPage !== undefined) {
			await page.goto(`${this.baseUrl}/conversations/${dmId}/page-${lastPage}`);
		}

		/**
         * Check whether the dm is a new dm based on the amount of messages present (field to reply is also a message)
         *
         * Get the ID of the user that send the message
         *
         * Get the message content
         */
		const {newDm, userId, message} = await page.evaluate(() => {
			const messages = Array.from(document.getElementsByClassName('message')) as HTMLElement[];
			const lastMessage = messages[messages.length - 2];

			const userId = (lastMessage.getElementsByClassName('username')[0] as HTMLLinkElement).href.match(/^(.*)\/members\/(.*)\.(\d*)\/$/)[3];

			const messageContentElement = lastMessage.getElementsByClassName('messageText')[0];
			messageContentElement.getElementsByClassName('messageTextEndMarker')[0].remove();

			const messageContent = messageContentElement.innerHTML.trim();

			return {
				newDm: messages.length === 2,
				userId,
				message: messageContent,
			};
		});

		/**
         * Emit the message so it can be handled elsewhere
         */
		this.emit('directMessage', {
			newDm,
			author: await this.getUserInfo(userId),
			message,
		});

		page.close();
	}

	private async hasDms(): Promise<boolean> {
		const page = await this.browser.newPage();
		await page.goto(this.baseUrl);

		/**
         * Checks the counter for the amount of messages a user has
         */
		const hasDms = await page.evaluate(() => {
			return document.getElementById('ConversationsMenu_Counter').getElementsByClassName('Total')[0].innerHTML !== '0';
		});

		page.close();

		return hasDms;
	}
}

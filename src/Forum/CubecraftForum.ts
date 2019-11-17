import { NewForumPost } from './blueprints/NewForumPost';
import { ForumUser } from './blueprints/ForumUser';
import { EventEmitter } from 'events';
import { launch } from 'puppeteer';
import { DirectMessage } from './blueprints/DirectMessage';

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

    private async handleDms(): Promise<void> {  
        if (!(await this.hasDms)) {
            return;
        }

        const page = await this.browser.newPage();
        await page.goto(`${this.baseUrl}/conversations`);

        /**
         * Get an array of every unread DM id, mark all as read
         */
        const dms: Array<string> = await page.evaluate(() => {
            let unread = Array.from(document.getElementsByClassName('unread')) as Array<HTMLElement>;
            let dms = [];

            for (let i in unread) {
                dms.push(unread[i].id.split('-')[1]);
            }

            const readToggle = Array.from(document.getElementsByClassName('ReadToggle')) as Array<HTMLLinkElement>;

            for (let i in readToggle) {
                if (readToggle[i].title.toLowerCase() === 'mark as read') {
                    readToggle[i].click();
                }
            }

            return dms;
        });

        /**
         * Handle each dm individually
         */
        for (let i in dms) {
            this.handleDm(dms[i]);
        }

        page.close();
    }

    private async handleDm(dmId: string) {
        const page = await this.browser.newPage();
        await page.goto(`${this.baseUrl}/conversations/${dmId}`);

        /**
         * If the dm has multiple pages, navigate to the last page
         */
        let lastPage = await page.evaluate(() => {
            let nav = document.getElementsByClassName('PageNav')[0];

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
            const messages = Array.from(document.getElementsByClassName('message')) as Array<HTMLElement>;
            const lastMessage = messages[messages.length - 2];

            

            let userId = (lastMessage.getElementsByClassName('username')[0] as HTMLLinkElement).href.match(/^(.*)\/members\/(.*)\.(\d*)\/$/)[3];

            let messageContentElement = lastMessage.getElementsByClassName('messageText')[0];
            messageContentElement.getElementsByClassName('messageTextEndMarker')[0].remove();

            let messageContent = messageContentElement.innerHTML.trim();
            
            return {
                newDm: messages.length === 2,
                userId: userId,
                message: messageContent
            }
        });

        /**
         * Emit the message so it can be handled elsewhere
         */
        this.emit('directMessage', {
            newDm: newDm,
            author: await this.getUserInfo(userId),
            message: message
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

    public async getUserInfo(id: string, forceRenew: boolean = false): Promise<ForumUser> {
        if (this.forumUsers[id] && !forceRenew) {
            return this.forumUsers[id];
        }

        const user = new ForumUser(id, this);
        await user.loadData();

        this.forumUsers[id] = user;

        return user;
    }
}
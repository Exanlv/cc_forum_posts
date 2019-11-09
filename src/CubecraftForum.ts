import { HtmlJson } from './HtmlJson';
import { NewForumPost } from './blueprints/NewForumPost';
import { ForumUser } from './blueprints/ForumUser';
import { EventEmitter } from 'events';
import { normalString } from './helper';

export class CubecraftForum extends EventEmitter {
    private baseUrl = 'https://www.cubecraft.net/';

    private recentPosts: Array<NewForumPost>;


    constructor(refreshTimer: number) {
        super();

        (async () => {
            this.recentPosts = await this.getMostRecentPosts();
        })();

        setInterval(async () => {
            if (!this.recentPosts) {
                this.recentPosts = await this.getMostRecentPosts();
            }

            let posts = await this.getMostRecentPosts();

            let hasNew = false;
            for (let i in posts) {
                if (posts[i].lastCommentTime !== this.recentPosts[i].lastCommentTime) {
                    hasNew = true;
                }
            }

            if (hasNew) {
                for (let i = posts.length - 1; i > -1; i--) {
                    if (!this.recentPosts.find((post) => post.threadLink === posts[i].threadLink && post.lastCommentTime === posts[i].lastCommentTime)) {
                        this.emit('forumPost', posts[i]);
                    }
                }

                this.recentPosts = posts;
            }

        }, refreshTimer);

        setTimeout(() => {
            this.emit('forumPost', this.recentPosts[0])
        }, 15000);
    }

    private async getPage(url: string): Promise<HtmlJson> {
        let page = new HtmlJson(url);
        await page.loadDom();
        return page;
    } 

    private async getMostRecentPosts(): Promise<Array<NewForumPost>> {
        let homepage = await this.getPage(this.baseUrl);

        let newPostsContainer = homepage.findElement((element) => element.attr && element.attr.class && element.attr.class.includes('widget_Threads'));

        newPostsContainer = homepage.findElement((element) => element.tag && element.tag === 'ul', [newPostsContainer]);

        if (!newPostsContainer.child) {
            return;
        }

        let newPosts = newPostsContainer.child;
        let output: Array<NewForumPost> = [];

        for (let i in newPosts) {
            if (!newPosts[i].tag || newPosts[i].tag !== 'li') {
                continue;
            }

            let threadCreator = new ForumUser;

            let threadCreatorImageElement = homepage.findElement((element) => element.tag && element.tag === 'img', newPosts[i].child);
            threadCreator.avatar = this.baseUrl + threadCreatorImageElement.attr.src;
            threadCreator.name = normalString(threadCreatorImageElement.attr.alt);

            let lastCommentCreator = new ForumUser;
            lastCommentCreator.name = (() => {
                let creatorElement = homepage.findElement((element) => element.tag && element.tag === 'div' && element.attr && element.attr.class && element.attr.class.includes('messageMeta'), newPosts[i].child)
                let link = homepage.findElement((element) => element.tag && element.tag === 'a', [creatorElement]);
                return normalString(link.child[0].text);
            })();

            let post = new NewForumPost;
            post.threadCreator = threadCreator;
            post.lastCommentCreator = lastCommentCreator;

            let threadInfo = homepage.findElement((element) => element.tag && element.tag === 'a' && element.attr.class && element.attr.class.includes('PreviewTooltip'), newPosts[i].child);

            post.title = threadInfo.child[0].text;
            post.threadLink = this.baseUrl + threadInfo.attr.href;

            let timeInfo = homepage.findElement((element) => element.attr && element.attr.class && element.attr.class.includes('DateTime'), newPosts[i].child);
            post.lastCommentTime = Number(timeInfo.attr['data-time']);

            output.push(post);
        }

        return output;
    }
}
import { ForumUser } from "./ForumUser";

export class NewForumPost {
    public title: string;
    public threadCreator: ForumUser;
    public lastCommentCreator: ForumUser;
    public threadLink: string;
    public lastCommentTime: number;

    public content?: string;
}
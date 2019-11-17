import { ForumUser } from "./ForumUser";

export class DirectMessage {
    public newDm: boolean;
    public author: ForumUser;
    public message: string;
}
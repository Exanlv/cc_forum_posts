import { ForumCommand } from "../blueprints/ForumCommand";
import { VerifyCommand } from "./VerifyCommand";

export const ForumCommandConfig: Array<ForumCommand> = [
    {
        key: 'verify',
        commandClass: VerifyCommand
    }
]
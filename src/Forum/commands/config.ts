import { ForumCommand } from '../blueprints/ForumCommand';
import { VerifyCommand } from './VerifyCommand';

export const ForumCommandConfig: ForumCommand[] = [
	{
		key: 'verify',
		commandClass: VerifyCommand,
	},
];

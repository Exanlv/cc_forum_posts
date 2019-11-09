import { Client, RichEmbed, TextChannel } from 'discord.js';
import { CubecraftForum } from './CubecraftForum';
import { NewForumPost } from './blueprints/NewForumPost';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import * as del from 'del';

export class Bot {
    public client: Client;
    private cubecraftForum: CubecraftForum;

    private servers: {[serverId: string]: string};

    constructor(token: string, refreshTimer: number) {
        this.loadServerConfiguration();

        this.client = new Client();

        this.client.on('ready', (client) => {
            console.log('Bot ready!');
        });
        
        this.cubecraftForum = new CubecraftForum(refreshTimer);

        this.registerMessageHandler();
        this.registerForumPostHandler();

        this.client.login(token);   
    }

    private registerMessageHandler(): void {
        this.client.on('message', async (message) => {
            if (!message.guild) {
                return;
            }

            if (message.content.startsWith(`<@${this.client.user.id}> `) && message.member.hasPermission('ADMINISTRATOR')) {
                let command = message.content.split(' ');

                switch (command[1].toLowerCase()) {
                    case 'set-channel':
                        if (this.servers[message.guild.id]) {
                            await this.removeServer(message.guild.id);
                        }

                        this.addServer(message.guild.id, message.channel.id);

                        try {
                            await message.channel.send('Channel set!');
                        } catch (e) {
                            
                        }
                    break;

                    case 'disable':
                        await this.removeServer(message.guild.id);

                        try {
                            await message.channel.send('Post updates disabled!');
                        } catch (e) {
                            
                        }
                    break;
                }
            }
        });
    }

    private registerForumPostHandler(): void {
        this.cubecraftForum.on('forumPost', async (forumPost: NewForumPost) => {
            const embed = new RichEmbed();

            embed.setTitle(`New post in ${forumPost.threadCreator.name}'s thread ${forumPost.title}`);
            embed.setColor('125280');
            embed.setThumbnail('https://cdn.discordapp.com/avatars/642788575028576264/8f61f3821106615cdde62cbea80aabfc.png');

            embed.addField(
                '**Post Info**',
                `${forumPost.lastCommentCreator.name} commented on thread ${forumPost.title}\n\n`
            );


            embed.addField(
                '**Post Link**',
                forumPost.threadLink + '\n\n'
            );

            embed.setTimestamp(forumPost.lastCommentTime * 1000);
            

            for (let i in this.servers) {
                let guild = this.client.guilds.find(g => g.id === i);

                if (!guild) {
                    return;
                }

                let channel = guild.channels.find(c => c.id === this.servers[i]) as TextChannel;

                if (!channel) {
                    return;
                }

                try {
                    await channel.send(embed);
                } catch (e) {

                }
            }
        });
    }

    private loadServerConfiguration(): void {
        this.servers = {};

        const dir = `${__dirname}/../guilds`;
        const files = readdirSync(dir);

        files.forEach((file) => {
            if (file === '.gitignore') {
                return;
            }

            this.servers[file] = readFileSync(`${dir}/${file}`).toString().replace(/[^0-9]/g, "");
        });
    }

    private addServer(serverId: string, channelId: string): void {
        writeFileSync(`${__dirname}/../guilds/${serverId}`, channelId);
    }

    private async removeServer(serverId: string): Promise<void> {
        await del(`${__dirname}/../guilds/${serverId}`);
    }
}
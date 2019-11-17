export class AdditionalUserInfo {
    public last_activity?: string;
    public joined?: string;
    public messages?: string;
    public likes_received: string;
    public trophy_points: string;
    public birthday: string;
    public gender: string;
    public location: string;
    public occupation: string;
    
    [property: string]: string;
}
export interface IRunnableCommand {

	/**
     * Gets called when command is triggered
     */
	run(): Promise<void>;
}

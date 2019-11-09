export function normalString(input: Array<string>|string): string {
    if (typeof input === 'string') {
        return input;
    }

    return input.join(' ')
}
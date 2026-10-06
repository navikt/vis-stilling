import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const isDevelopment = process.env.NODE_ENV === 'development';

const mockDirectory = join(process.cwd(), 'mock', 'eksempler');
const devMockFileByIdentifier: Record<string, string> = {
    stilling: 'stilling.json',
    '9983a5ef-e573-4ee8-b73c-7e617a1d896a': 'stilling.json',
    'annen-stilling': 'annen-stilling.json',
    annenStilling: 'annen-stilling.json',
    'c7ebcc88-02a1-4eec-80e1-f7a866744f0e': 'annen-stilling.json',
    'upublisert-stilling': 'upublisert-stilling.json',
    upublisertStilling: 'upublisert-stilling.json',
    'slettet-stilling': 'slettet-stilling.json',
    slettetStilling: 'slettet-stilling.json',
    'formatert-stilling': 'formatert-stilling.json',
    formatertStilling: 'formatert-stilling.json',
    'stilling-uten-jobtitle': 'stilling-uten-jobtitle.json',
};
const defaultMockFile = 'annen-stilling.json';
const mockCache = new Map<string, unknown>();

export const shouldUseDevMocks = () => isDevelopment && !process.env.STILLING_API;

export const readMockData = async (stillingsId: string) => {
    const kjentFil = devMockFileByIdentifier[stillingsId];
    const parsed = await lesFil(kjentFil ?? defaultMockFile);
    // Ukjente id-er (f.eks. samtykke-ja) beholder id-en sin, så samtykke-mocken treffer riktig scenario
    return kjentFil ? parsed : { ...(parsed as object), uuid: stillingsId };
};

const lesFil = async (file: string) => {
    const cached = mockCache.get(file);
    if (cached) {
        return cached;
    }

    const content = await readFile(join(mockDirectory, file), 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    mockCache.set(file, parsed);
    return parsed;
};

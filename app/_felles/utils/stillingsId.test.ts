import { describe, expect, it } from 'vitest';

import { erGyldigStillingsId, tolkStillingsId } from './stillingsId';

const uuid = '9983a5ef-e573-4ee8-b73c-7e617a1d896a';

describe('erGyldigStillingsId', () => {
    it('godtar UUID med små og store bokstaver', () => {
        expect(erGyldigStillingsId(uuid)).toBe(true);
        expect(erGyldigStillingsId(uuid.toUpperCase())).toBe(true);
    });

    it.each([
        ['undefined'],
        ['null'],
        [''],
        [`${uuid}.`],
        [`${uuid}æ`],
        [`${uuid}%C3%83%C2%A6`],
        [`${uuid}0`],
        [uuid.slice(0, -1)],
        ['9983a5efe5734ee8b73c7e617a1d896a'],
        ['../9983a5ef-e573-4ee8-b73c-7e617a1d896a'],
    ])('avviser %s', (id) => {
        expect(erGyldigStillingsId(id)).toBe(false);
    });

    it('avviser undefined og null', () => {
        expect(erGyldigStillingsId(undefined)).toBe(false);
        expect(erGyldigStillingsId(null)).toBe(false);
    });
});

describe('tolkStillingsId', () => {
    it('returnerer gyldig for en ren UUID', () => {
        expect(tolkStillingsId(uuid)).toEqual({ type: 'gyldig', stillingsId: uuid });
    });

    it.each([
        [`${uuid}.`],
        [`${uuid}æ`],
        [`${uuid}%C3%A6`],
        [`${uuid}%C3%83%C2%A6`],
        [`${uuid}),`],
        [`${uuid}%20`],
        [` ${uuid}`],
        [`${uuid}%`],
    ])('omdirigerer %s til UUID-en', (id) => {
        expect(tolkStillingsId(id)).toEqual({ type: 'omdiriger', stillingsId: uuid });
    });

    it.each([
        ['undefined'],
        [''],
        ['stilling'],
        [`${uuid}0`],
        [`${uuid}abc`],
        [uuid.slice(0, -1)],
        [`x${uuid}`],
    ])('returnerer ugyldig for %s', (id) => {
        expect(tolkStillingsId(id)).toEqual({ type: 'ugyldig' });
    });

    it('returnerer ugyldig for undefined og null', () => {
        expect(tolkStillingsId(undefined)).toEqual({ type: 'ugyldig' });
        expect(tolkStillingsId(null)).toEqual({ type: 'ugyldig' });
    });
});

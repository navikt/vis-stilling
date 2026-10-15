import { isValid, parse, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

export const NORSK_DATO_FORMAT = 'dd.MM.yyyy';

export const erNorskDatostreng = (verdi: string | null | undefined): boolean =>
    typeof verdi === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(verdi);

export const tilDato = (dateString: string | Date | undefined | null): Date | null => {
    if (!dateString) return null;

    if (dateString instanceof Date) {
        return isValid(dateString) ? dateString : null;
    }

    // 1. Prøv å parse 'dd.MM.yyyy'
    let parsedDate = parse(dateString, NORSK_DATO_FORMAT, new Date(), {
        locale: nb,
    });
    if (isValid(parsedDate)) {
        return parsedDate;
    }

    // 2. Prøv å parse ISO 8601-formater (håndterer '2025-05-16T10:18:00.069088026')
    // parseISO er generelt robust for disse.
    parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
        return parsedDate;
    }

    // 3. Prøv å bruke JavaScript's innebygde Date-konstruktør
    // Dette var en del av den opprinnelige logikken. parseISO er vanligvis foretrukket for ISO-strenger.
    const genericDate = new Date(dateString);
    if (isValid(genericDate)) {
        return genericDate;
    }

    return null;
};

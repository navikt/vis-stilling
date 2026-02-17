import { format, isBefore, isValid, parse, parseISO, startOfToday } from 'date-fns';
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

type FormaterNorskDatoProps = {
    dato: string | Date | undefined | null;
    visning?: 'kortMåned' | 'tall';
    visTid?: boolean;
};

export const formaterNorskDato = (props: FormaterNorskDatoProps): string | null => {
    const { dato, visning, visTid } = props;
    const parsedDato = tilDato(dato);

    if (!parsedDato && typeof dato === 'string') {
        return dato;
    }

    if (!parsedDato) {
        return null;
    }

    const getBaseDateFormat = () => {
        if (visning === 'kortMåned') {
            return 'd. MMM yyyy';
        }
        if (visning === 'tall') {
            return NORSK_DATO_FORMAT;
        }
        return 'd. MMMM yyyy';
    };

    const baseFormat = getBaseDateFormat();
    const finalFormat = visTid ? `${baseFormat} 'kl.' HH:mm` : baseFormat;

    return format(parsedDato, finalFormat, { locale: nb });
};

export const formaterFraISOdato = (dato: string) => {
    if (erNorskDatostreng(dato)) return dato;
    return format(new Date(dato), NORSK_DATO_FORMAT);
};


export const datoErIFortiden = (dato?: string | null) => {
    const parsed = tilDato(dato);
    if (!parsed) return false;
    return isBefore(parsed, startOfToday());
};

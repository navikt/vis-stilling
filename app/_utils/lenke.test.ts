import { describe, expect, it } from 'vitest';

import { lagEksternLenke } from './lenke';

describe('lagEksternLenke', () => {
    it('legger til https:// når lenken mangler protokoll', () => {
        expect(lagEksternLenke('www.eksempel.no')).toBe('https://www.eksempel.no/');
        expect(lagEksternLenke('eksempel.no/jobb?id=1')).toBe('https://eksempel.no/jobb?id=1');
        expect(lagEksternLenke('www.eksempel.no:8080/sok')).toBe(
            'https://www.eksempel.no:8080/sok'
        );
        expect(lagEksternLenke('//www.eksempel.no')).toBe('https://www.eksempel.no/');
    });

    it('beholder lenker med http eller https', () => {
        expect(lagEksternLenke('https://www.eksempel.no/sok')).toBe('https://www.eksempel.no/sok');
        expect(lagEksternLenke('http://www.eksempel.no')).toBe('http://www.eksempel.no/');
        expect(lagEksternLenke('HTTPS://WWW.EKSEMPEL.NO')).toBe('https://www.eksempel.no/');
        expect(lagEksternLenke('  https://www.eksempel.no  ')).toBe('https://www.eksempel.no/');
    });

    it('avviser andre protokoller enn http og https', () => {
        expect(lagEksternLenke('javascript:alert(1)')).toBeUndefined();
        expect(lagEksternLenke('JavaScript:alert(1)')).toBeUndefined();
        expect(lagEksternLenke(' javascript:alert(1)')).toBeUndefined();
        expect(lagEksternLenke('java\tscript:alert(1)')).toBeUndefined();
        expect(lagEksternLenke('data:text/html,<script>alert(1)</script>')).toBeUndefined();
        expect(lagEksternLenke('vbscript:msgbox(1)')).toBeUndefined();
        expect(lagEksternLenke('mailto:post@eksempel.no')).toBeUndefined();
        expect(lagEksternLenke('mailto:123@eksempel.no')).toBeUndefined();
        expect(lagEksternLenke('tel:12345678')).toBeUndefined();
        expect(lagEksternLenke('ftp://eksempel.no')).toBeUndefined();
    });

    it('returnerer den normaliserte lenken og ikke råverdien', () => {
        expect(lagEksternLenke('www.eksempel.no/sti med mellomrom')).toBe(
            'https://www.eksempel.no/sti%20med%20mellomrom'
        );
        expect(lagEksternLenke('https://www.eksempel.no/a\nb')).toBe('https://www.eksempel.no/ab');
    });

    it('avviser tomme og ugyldige lenker', () => {
        expect(lagEksternLenke(undefined)).toBeUndefined();
        expect(lagEksternLenke(null)).toBeUndefined();
        expect(lagEksternLenke('')).toBeUndefined();
        expect(lagEksternLenke('   ')).toBeUndefined();
        expect(lagEksternLenke('@eksempel')).toBeUndefined();
        expect(lagEksternLenke('ikke en lenke')).toBeUndefined();
    });
});

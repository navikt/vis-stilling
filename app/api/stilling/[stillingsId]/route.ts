import { logger } from '@navikt/next-logger';
import type { NextRequest } from 'next/server';

import {
    buildUpstreamUrl,
    copyHeaders,
    getClientCredentialsToken,
    getUpstreamBase,
    readMockData,
    shouldUseDevMocks,
} from '../helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteParams = {
    stillingsId: string;
};

export async function GET(request: NextRequest, context: { params: Promise<RouteParams> }) {
    const { stillingsId: rawStillingsId } = await context.params;
    const stillingsId = rawStillingsId?.trim();

    if (!stillingsId) {
        logger.warn('GET /api/stilling/[stillingsId] mangler stillingsId parameter');
        return new Response('stillingsId må være satt i path', {
            status: 400,
        });
    }

    if (shouldUseDevMocks()) {
        const mock = await readMockData(stillingsId);

        return new Response(JSON.stringify(mock), {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        });
    }

    let upstreamUrl: string | undefined;

    try {
        const url = buildUpstreamUrl(stillingsId);
        upstreamUrl = url.toString();
        const token = await getClientCredentialsToken();

        const upstreamHeaders = new Headers();
        upstreamHeaders.set('Authorization', `Bearer ${token}`);
        const accepts = request.headers.get('accept');
        if (accepts) {
            upstreamHeaders.set('accept', accepts);
        }

        const upstreamResponse = await fetch(url, {
            method: 'GET',
            headers: upstreamHeaders,
            cache: 'no-store',
        });

        if (!upstreamResponse.body) {
            const text = await upstreamResponse.text();
            return new Response(text, {
                status: upstreamResponse.status,
                statusText: upstreamResponse.statusText,
            });
        }

        const response = new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
        });

        copyHeaders(upstreamResponse.headers, response.headers, ['content-type', 'cache-control']);

        return response;
    } catch (error) {
        const errorDetails =
            error instanceof Error
                ? { err: error }
                : { err: new Error(typeof error === 'string' ? error : 'Ukjent feil') };

        const cause =
            error instanceof Error && 'cause' in error
                ? (error as Error & { cause?: unknown }).cause
                : undefined;

        const causeMessage =
            cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : undefined;

        logger.error(
            {
                ...errorDetails,
                stillingsId,
                upstreamUrl,
                harUpstreamBase: Boolean(getUpstreamBase()),
                årsak: causeMessage,
            },
            'Feil ved kall til stillingsendepunktet'
        );

        const message =
            error instanceof Error ? error.message : 'Ukjent feil ved henting av stillingsdata';

        return new Response(message, {
            status: 502,
        });
    }
}

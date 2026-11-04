import { NextRequest, NextResponse } from 'next/server';
import { erVeileder } from '../../../_utils/util.ts';
import { ModiaContextHolder } from '../../api-routes-with-obo.ts';
import { proxyWithOBO } from '../../oboProxy.ts';

// Bare veilederappen har Azure-innlogging og tilgang til modiacontextholder
const proxy = (req: NextRequest) =>
    erVeileder
        ? proxyWithOBO(ModiaContextHolder, req)
        : NextResponse.json({ feil: 'Ikke funnet' }, { status: 404 });

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;

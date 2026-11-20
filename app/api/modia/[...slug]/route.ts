import { NextRequest, NextResponse } from 'next/server';
import { erVeileder } from '../../../_felles/utils/util.ts';
import { ModiaContextHolder } from '../../../_felles/api/api-routes-with-obo.ts';
import { proxyWithOBO } from '../../../_felles/api/oboProxy.ts';

// Bare veilederappen har Azure-innlogging og tilgang til modiacontextholder
const proxy = (req: NextRequest) =>
    erVeileder
        ? proxyWithOBO(ModiaContextHolder, req)
        : NextResponse.json({ feil: 'Ikke funnet' }, { status: 404 });

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;

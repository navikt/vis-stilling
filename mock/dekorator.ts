// Kjøres i nettleseren før dekoratøren, så den må være selvstendig (ingen imports/closures)
const mockDekoratorFetch = () => {
    const originalFetch = window.fetch.bind(window);
    const json = (data: unknown) =>
        new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    window.fetch = (input, init) => {
        const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const env = (window as { __DECORATOR_DATA__?: { env?: Record<string, string> } })
            .__DECORATOR_DATA__?.env;

        if (env?.LOGIN_SESSION_API_URL && url.startsWith(env.LOGIN_SESSION_API_URL)) {
            return Promise.resolve(
                json({
                    session: { ends_in_seconds: 3600, active: true },
                    tokens: { expire_in_seconds: 3600 },
                })
            );
        }

        if (env?.APP_URL && url.startsWith(`${env.APP_URL}/auth`)) {
            return Promise.resolve(
                json({
                    auth: {
                        authenticated: true,
                        name: 'Test bruker',
                        securityLevel: '4',
                        userId: '123456789',
                    },
                    usermenuHtml: '<span>Test bruker</span>',
                })
            );
        }

        return originalFetch(input, init);
    };
};

export const dekoratorMockScript = `(${mockDekoratorFetch.toString()})();`;

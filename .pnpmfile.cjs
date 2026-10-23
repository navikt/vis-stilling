// typescript-eslint støtter ikke TypeScript 7 ennå. ESLint-parseren får TypeScript 6, mens appen bruker 7.
// Se https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0
module.exports = {
    hooks: {
        readPackage(pakke) {
            if (
                pakke.name?.startsWith('@typescript-eslint/') &&
                pakke.peerDependencies?.typescript
            ) {
                delete pakke.peerDependencies.typescript;
                pakke.dependencies = {
                    ...pakke.dependencies,
                    typescript: 'npm:@typescript/typescript6@^6.0.2',
                };
            }
            return pakke;
        },
    },
};

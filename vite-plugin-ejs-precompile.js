import lodash from 'lodash';
const { template: lodashTemplate } = lodash;

const HTML_ESCAPE_FN = `function escapeFallback(s){var m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};return s==null?'':String(s).replace(/[&<>"']/g,function(c){return m[c];});}`;

export function ejsPrecompile() {
    return {
        name: 'ejs-precompile',
        enforce: 'pre',
        transform(src, id) {
            if (!id.endsWith('.ejs')) return null;

            const compiled = lodashTemplate(src, {
                // Match EJS semantics: <%= %> is escaped, <%- %> is raw
                escape: /<%=([\s\S]+?)%>/g,
                interpolate: /<%-([^>]+?)%>/g,
                evaluate: /<%(?![=-])([\s\S]+?)%>/g,
                variable: 'data',
            });

            const body = compiled.source
                .replace('_.escape', `escapeFallback`);

            return {
                code: `${HTML_ESCAPE_FN};export default ${body};`,
                map: null,
            };
        },
    };
}

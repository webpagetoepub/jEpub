'use strict';

import { zip, strToU8 } from 'fflate';
import * as utils from './utils/index.js';
import { detectImageType } from './utils/mime.js';

import language from './i18n.json';

import container from './tpl/META-INF/container.xml?raw';
import mime from './tpl/mimetype?raw';
import renderCover from './tpl/OEBPS/front-cover.html.ejs';
import renderNotes from './tpl/OEBPS/notes.html.ejs';
import renderPage from './tpl/OEBPS/page.html.ejs';
import renderTocInBook from './tpl/OEBPS/table-of-contents.html.ejs';
import renderInfo from './tpl/OEBPS/title-page.html.ejs';
import renderBookConfig from './tpl/book.opf.ejs';
import renderToc from './tpl/toc.ncx.ejs';

export default class jEpub {
    constructor() {
        this._I18n = {}; // Object - Language translations
        this._Info = {}; // Object - Book information (title, author, etc.)
        this._Uuid = {}; // Object - UUID information with scheme and id
        this._Date = null; // string | null - ISO date string
        this._Cover = null; // Object | null - Cover image information

        this._Pages = []; // Array<string> - Array of page titles
        this._Images = []; // Array<Object> - Array of image objects with type and path

        this._Zip = {}; // fflate files store { path: data }
    }

    /**
     * Initialize the jEpub instance
     * @param {Object} details - Book details object
     * @returns {jEpub} - Returns this instance for method chaining
     */
    init(details) {
        this._Info = Object.assign(
            {},
            {
                i18n: 'en',
                title: 'undefined',
                author: 'undefined',
                publisher: 'undefined',
                description: '',
                tags: [],
            },
            details
        );

        this._Uuid = {
            scheme: 'uuid',
            id: utils.uuidv4(),
        };

        this._Date = utils.getISODate();

        if (!language[this._Info.i18n])
            throw `Unknown Language: ${this._Info.i18n}`;
        this._I18n = language[this._Info.i18n];

        this._Zip = {};
        this._Zip['mimetype'] = mime;
        this._Zip['META-INF/container.xml'] = container;
        this._Zip['OEBPS/title-page.html'] = renderInfo({
            i18n: this._I18n,
            title: this._Info.title,
            author: this._Info.author,
            publisher: this._Info.publisher,
            description: utils.parseDOM(this._Info.description),
            tags: this._Info.tags,
        });

        return this;
    }

    /**
     * Convert HTML to plain text
     * @param {string} html - HTML string to convert
     * @param {boolean} noBr - Whether to remove line breaks
     * @returns {string} - Plain text string
     */
    static html2text(html, noBr = false) {
        return utils.html2text(html, noBr);
    }

    /**
     * Set the publication date
     * @param {Date} date - Date object for the publication
     * @returns {jEpub} - Returns this instance for method chaining
     * @throws {string} - Throws error if date is not valid
     */
    date(date) {
        if (date instanceof Date) {
            this._Date = utils.getISODate(date);
            return this;
        } else {
            throw 'Date object is not valid';
        }
    }

    /**
     * Set the UUID for the book
     * @param {string} id - UUID string or URL
     * @returns {jEpub} - Returns this instance for method chaining
     * @throws {string} - Throws error if UUID is empty
     */
    uuid(id) {
        if (utils.isEmpty(id)) {
            throw 'UUID value is empty';
        } else {
            let scheme = 'uuid'; // string - UUID scheme type
            if (utils.validateUrl(id)) scheme = 'URI';
            this._Uuid = {
                scheme,
                id,
            };
            return this;
        }
    }

    /**
     * Set the cover image for the book
     * @param {Blob | ArrayBuffer} data - Image data as Blob or ArrayBuffer
     * @returns {jEpub} - Returns this instance for method chaining
     * @throws {string} - Throws error if cover data is invalid
     */
    cover(data) {
        let ext, mime; // string - File extension and MIME type
        if (data instanceof Blob) {
            mime = data.type;
            ext = utils.mime2ext(mime);
        } else if (data instanceof ArrayBuffer) {
            ext = detectImageType(new Uint8Array(data));
            if (ext) {
                mime = ext.mime;
                ext = utils.mime2ext(mime);
            }
        } else {
            throw 'Cover data is not valid';
        }
        if (!ext) throw 'Cover data is not allowed';

        this._Cover = {
            type: mime,
            path: `OEBPS/cover-image.${ext}`,
        };
        this._Zip[this._Cover.path] = data;
        this._Zip['OEBPS/front-cover.html'] = renderCover({
            i18n: this._I18n,
            cover: this._Cover,
        });
        return this;
    }

    /**
     * Add an image to the book
     * @param {Blob | ArrayBuffer} data - Image data as Blob or ArrayBuffer
     * @param {string} name - Name for the image file
     * @returns {jEpub} - Returns this instance for method chaining
     * @throws {string} - Throws error if image data is invalid
     */
    image(data, name) {
        let ext, mime; // string - File extension and MIME type
        if (data instanceof Blob) {
            mime = data.type;
            ext = utils.mime2ext(mime);
        } else if (data instanceof ArrayBuffer) {
            ext = detectImageType(new Uint8Array(data));
            mime = ext.mime;
            if (ext) ext = utils.mime2ext(mime);
        } else {
            throw 'Image data is not valid';
        }
        if (!ext) throw 'Image data is not allowed';

        const filePath = `assets/${name}.${ext}`; // string - File path for the image
        this._Images[name] = {
            type: mime,
            path: filePath,
        };
        this._Zip[`OEBPS/${filePath}`] = data;
        return this;
    }

    /**
     * Add notes to the book
     * @param {string} content - HTML content for the notes
     * @returns {jEpub} - Returns this instance for method chaining
     * @throws {string} - Throws error if notes content is empty
     */
    notes(content) {
        if (utils.isEmpty(content)) {
            throw 'Notes is empty';
        } else {
            this._Zip['OEBPS/notes.html'] = renderNotes({
                i18n: this._I18n,
                notes: utils.parseDOM(content),
            });
            return this;
        }
    }

    /**
     * Add a page to the book
     * @param {string} title - Title of the page
     * @param {string | Array | null} content - HTML content for the page or array of content
     * @param {number} level - Hierarchy level of the page
     * @returns {jEpub} - Returns this instance for method chaining
     * @throws {string} - Throws error if title is empty or level is invalid
     */
    add(title, content = null, level = 0) {
        if (utils.isEmpty(title)) {
            throw 'Title is empty';
        }

        if (typeof level !== 'number' || isNaN(level) || level < 0) {
            throw 'Level must be a non-negative number';
        }
        const lastPage = this._Pages[this._Pages.length - 1];
        if (lastPage && level > lastPage.level + 1) {
            throw `Invalid TOC hierarchy: Level can only increase by 1 (from ${lastPage.level} to ${lastPage.level + 1})`;
        }

        if (content && !Array.isArray(content)) {
            const images = this._Images;
            const fallback =
                'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            content = content.replace(/<%=[\s]*image\[['"]([\S]*?)['"]\][\s]*%>/g, (_, expr) => {
                const img = images[expr.trim()];
                return `<img src="${img ? img.path : fallback}" alt="" />`;
            });
            content = content.replace(/<%=[\s]*image_path\[['"]([\S]*?)['"]\][\s]*%>/g, (_, expr) => {
                const img = images[expr.trim()];
                return img ? img.path : fallback;
            });
            content = utils.parseDOM(content);
        }

        const pageId = this._Pages.length;
        this._Zip[`OEBPS/page-${pageId}.html`] = renderPage({
            i18n: this._I18n,
            title,
            content,
        });
        this._Pages.push({
            title,
            level,
        });
        return this;
    }

    /**
     * Generate the EPUB file
     * @param {string} type - Output type ('blob', 'arraybuffer', 'uint8array', etc.)
     * @param {Function} onUpdate - Optional callback function for progress updates
     * @returns {Promise} - Promise that resolves to the generated EPUB file
     * @throws {string} - Throws error if browser doesn't support the specified type
     */
    generate(type = 'blob', onUpdate) {
        const supported = new Set(['blob', 'arraybuffer', 'uint8array', 'base64']);
        if (!supported.has(type)) throw `This browser does not support ${type}`;

        const notes = 'OEBPS/notes.html' in this._Zip;

        this._Zip['book.opf'] = renderBookConfig({
            i18n: this._I18n,
            uuid: this._Uuid,
            date: this._Date,
            title: this._Info.title,
            author: this._Info.author,
            publisher: this._Info.publisher,
            description: utils.html2text(this._Info.description, true),
            tags: this._Info.tags,
            cover: this._Cover,
            pages: this._Pages,
            notes,
            images: this._Images,
        });

        this._Zip['OEBPS/table-of-contents.html'] = renderTocInBook({
            i18n: this._I18n,
            pages: this._Pages,
        });

        this._Zip['toc.ncx'] = renderToc({
            i18n: this._I18n,
            uuid: this._Uuid,
            title: this._Info.title,
            author: this._Info.author,
            pages: this._Pages,
            notes,
        });

        return (async () => {
            const fflateFiles = {};
            for (const [path, content] of Object.entries(this._Zip)) {
                let data;
                if (typeof content === 'string') {
                    data = strToU8(content);
                } else if (content instanceof Blob) {
                    data = new Uint8Array(await content.arrayBuffer());
                } else if (content instanceof ArrayBuffer) {
                    data = new Uint8Array(content);
                } else {
                    data = content;
                }
                fflateFiles[path] = path === 'mimetype' ? [data, { level: 0 }] : [data, { level: 9 }];
            }

            return new Promise((resolve, reject) => {
                zip(fflateFiles, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    if (onUpdate) {
                        onUpdate({ percent: 100 });
                    }
                    if (type === 'uint8array') {
                        return resolve(data);
                    }
                    if (type === 'arraybuffer') {
                        return resolve(data.buffer);
                    }
                    if (type === 'base64') {
                        if (typeof globalThis.btoa !== 'undefined') {
                            return resolve(globalThis.btoa(Array.from(data, (b) => String.fromCharCode(b)).join('')));
                        }

                        return globalThis.Buffer.from(data).toString('base64');
                    }
                    resolve(new Blob([data], { type: mime }));
                });
            });
        })();
    }
}

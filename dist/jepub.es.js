/*! jepub - 2.5.0 | (c) 2018 lelinhtinh | ISC | https://lelinhtinh.github.io/jEpub/ */
import { strToU8, zip } from "fflate";
function uuidv4() {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("crypto.getRandomValues is not available");
  }
  return ("10000000-1000-4000-8000" + -1e11).replace(
    /[018]/g,
    (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
function isEmpty(val) {
  if (val === null) {
    return true;
  }
  if (typeof val === "string") {
    return !val.trim();
  }
  return false;
}
function validateUrl(value) {
  if (typeof value !== "string") {
    return false;
  }
  if (typeof URL === "undefined") {
    return /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      value
    );
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
function getISODate(date = /* @__PURE__ */ new Date()) {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (date === null) {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  return dateObj.toISOString();
}
function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) {
    return null;
  }
  if (buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10) {
    return { mime: "image/png", ext: "png" };
  }
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (buffer[0] === 71 && buffer[1] === 73 && buffer[2] === 70) {
    return { mime: "image/gif", ext: "gif" };
  }
  if (buffer[0] === 66 && buffer[1] === 77) {
    return { mime: "image/bmp", ext: "bmp" };
  }
  if (buffer[0] === 82 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 70 && buffer[8] === 87 && buffer[9] === 69 && buffer[10] === 66 && buffer[11] === 80) {
    return { mime: "image/webp", ext: "webp" };
  }
  if (buffer.length >= 100) {
    try {
      const text = String.fromCharCode(...buffer.slice(0, 100));
      if (text.includes("<svg") || text.includes("<?xml") && text.includes("svg")) {
        return { mime: "image/svg+xml", ext: "svg" };
      }
    } catch {
    }
  }
  if (buffer[0] === 73 && buffer[1] === 73 && buffer[2] === 42 && buffer[3] === 0 || buffer[0] === 77 && buffer[1] === 77 && buffer[2] === 0 && buffer[3] === 42) {
    return { mime: "image/tiff", ext: "tif" };
  }
  if (buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 1 && buffer[3] === 0) {
    return { mime: "image/x-icon", ext: "ico" };
  }
  return null;
}
function mime2ext(mime2) {
  if (typeof mime2 !== "string") {
    return null;
  }
  const cleanMime = mime2.trim().toLowerCase().split(";")[0];
  const MIME_TO_EXTENSION = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "image/apng": "apng",
    "image/png": "png",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/tiff": "tif",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico"
  };
  if (MIME_TO_EXTENSION[cleanMime]) {
    return MIME_TO_EXTENSION[cleanMime];
  }
  if (cleanMime.startsWith("image/")) {
    const extension = cleanMime.split("/")[1];
    if (["gif", "apng", "png", "webp", "bmp"].includes(extension)) {
      return extension;
    }
  }
  return null;
}
function parseDOM(html, outText = false) {
  if (html == null || typeof html !== "string") {
    return "";
  }
  const DOMParserToUse = globalThis.DOMParser;
  const XMLSerializerToUse = globalThis.XMLSerializer;
  const doc = new DOMParserToUse().parseFromString(
    `<!doctype html><body>${html}</body>`,
    "text/html"
  );
  const bodyElement = doc.body || doc.documentElement;
  if (!doc || !bodyElement) {
    return "";
  }
  if (outText) {
    return bodyElement.textContent.trim();
  }
  const serializer = new XMLSerializerToUse();
  const serializedDoc = serializer.serializeToString(bodyElement);
  return serializedDoc.replace(/(^<body\s?[^>]*>|<\/body>$)/g, "");
}
function html2text(html, noBr = false) {
  if (typeof html !== "string") {
    return "";
  }
  let cleanHtml = html.replace(/<style([\s\S]*?)<\/style>/gi, "");
  cleanHtml = cleanHtml.replace(/<script([\s\S]*?)<\/script>/gi, "");
  cleanHtml = cleanHtml.replace(/<\/(div|p|li|dd|h[1-6])>/gi, "\n");
  cleanHtml = cleanHtml.replace(/<(br|hr)\s*[/]?>/gi, "\n");
  cleanHtml = cleanHtml.replace(/<li>/gi, "+ ");
  cleanHtml = cleanHtml.replace(/<[^>]+>/g, "");
  cleanHtml = cleanHtml.replace(/\n{3,}/g, "\n\n");
  const result = parseDOM(cleanHtml, true);
  return noBr ? result.replace(/\n+/g, " ") : result;
}
const en = { "code": "en", "cover": "Cover", "toc": "Table of Contents", "info": "Information", "note": "Notes" };
const vi = { "code": "vi", "cover": "Bìa sách", "toc": "Mục lục", "info": "Giới thiệu", "note": "Ghi chú" };
const hi = { "code": "hi", "cover": "आवरण", "toc": "विषय - सूची", "info": "जानकारी", "note": "टिप्पणियाँ" };
const fr = { "code": "fr", "cover": "Couverture", "toc": "Table des matières", "info": "Information", "note": "Notes" };
const de = { "code": "de", "cover": "Umschlag", "toc": "Inhaltsverzeichnis", "info": "Information", "note": "Notizen" };
const es = { "code": "es", "cover": "Portada", "toc": "Tabla de contenidos", "info": "Información", "note": "Notas" };
const it = { "code": "it", "cover": "Copertina", "toc": "Indice", "info": "Informazioni", "note": "Note" };
const pt = { "code": "pt", "cover": "Capa", "toc": "Índice", "info": "Informação", "note": "Notas" };
const ru = { "code": "ru", "cover": "Обложка", "toc": "Содержание", "info": "Информация", "note": "Заметки" };
const ja = { "code": "ja", "cover": "表紙", "toc": "目次", "info": "情報", "note": "ノート" };
const ko = { "code": "ko", "cover": "표지", "toc": "목차", "info": "정보", "note": "메모" };
const zh = { "code": "zh", "cover": "封面", "toc": "目录", "info": "信息", "note": "注释" };
const ar = { "code": "ar", "cover": "الغلاف", "toc": "جدول المحتويات", "info": "معلومات", "note": "ملاحظات" };
const nl = { "code": "nl", "cover": "Omslag", "toc": "Inhoudsopgave", "info": "Informatie", "note": "Notities" };
const sv = { "code": "sv", "cover": "Omslag", "toc": "Innehållsförteckning", "info": "Information", "note": "Anteckningar" };
const da = { "code": "da", "cover": "Omslag", "toc": "Indholdsfortegnelse", "info": "Information", "note": "Noter" };
const no = { "code": "no", "cover": "Omslag", "toc": "Innholdsfortegnelse", "info": "Informasjon", "note": "Notater" };
const fi = { "code": "fi", "cover": "Kansi", "toc": "Sisällysluettelo", "info": "Tiedot", "note": "Muistiinpanot" };
const pl = { "code": "pl", "cover": "Okładka", "toc": "Spis treści", "info": "Informacje", "note": "Notatki" };
const cs = { "code": "cs", "cover": "Obal", "toc": "Obsah", "info": "Informace", "note": "Poznámky" };
const tr = { "code": "tr", "cover": "Kapak", "toc": "İçindekiler", "info": "Bilgi", "note": "Notlar" };
const language = {
  en,
  vi,
  hi,
  fr,
  de,
  es,
  it,
  pt,
  ru,
  ja,
  ko,
  zh,
  ar,
  nl,
  sv,
  da,
  no,
  fi,
  pl,
  cs,
  tr
};
const container = '<?xml version="1.0" encoding="UTF-8" ?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n	<rootfiles>\n		<rootfile full-path="book.opf" media-type="application/oebps-package+xml" />\n	</rootfiles>\n</container>';
const mime = "application/epub+zip";
function escapeFallback$6(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s == null ? "" : String(s).replace(/[&<>"']/g, function(c) {
    return m[c];
  });
}
function renderCover(data) {
  var __p = "", __e = escapeFallback$6;
  __p += '<?xml version="1.0" encoding="UTF-8" ?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="' + __e(data.i18n.code) + '"><head><title>' + __e(data.i18n.cover) + '</title><meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8"/></head><body><div id="cover-image"><img src="../' + __e(data.cover.path) + '" alt="' + __e(data.i18n.cover) + '"/></div></body></html>';
  return __p;
}
function escapeFallback$5(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s == null ? "" : String(s).replace(/[&<>"']/g, function(c) {
    return m[c];
  });
}
function renderNotes(data) {
  var __t, __p = "", __e = escapeFallback$5;
  __p += '<?xml version="1.0" encoding="UTF-8" ?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="' + __e(data.i18n.code) + '"><head><title>' + __e(data.i18n.note) + '</title><meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8"/></head><body><div id="notes-page"><div class="ugc">' + ((__t = data.notes) == null ? "" : __t) + " </div></div></body></html>";
  return __p;
}
function escapeFallback$4(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s == null ? "" : String(s).replace(/[&<>"']/g, function(c) {
    return m[c];
  });
}
function renderPage(data) {
  var __t, __p = "", __e = escapeFallback$4;
  __p += '<?xml version="1.0" encoding="UTF-8" ?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="' + __e(data.i18n.code) + '"><head><title>' + __e(data.title) + '</title><meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8"/></head><body><div class="chapter type-1"><div class="chapter-title-wrap"><h2 class="chapter-title">' + __e(data.title) + "</h2></div>";
  if (data.content) {
    __p += ' <div class="ugc chapter-ugc">';
    if (Array.isArray(data.content)) {
      __p += " ";
      data.content.forEach((item) => {
        __p += ' <p class="indent">' + __e(item) + "</p>";
      });
      __p += " ";
    } else {
      __p += " " + ((__t = data.content) == null ? "" : __t) + " ";
    }
    __p += " </div>";
  }
  __p += " </div></body></html>";
  return __p;
}
function escapeFallback$3(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s == null ? "" : String(s).replace(/[&<>"']/g, function(c) {
    return m[c];
  });
}
function renderTocInBook(data) {
  var __p = "", __e = escapeFallback$3;
  __p += '<?xml version="1.0" encoding="UTF-8" ?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="' + __e(data.i18n.code) + '"><head><title>' + __e(data.i18n.toc) + '</title><meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8"/></head><body><div id="toc"><h1>' + __e(data.i18n.toc) + "</h1><ul>";
  let currentLevel = 0;
  __p += " ";
  data.pages.forEach(({ title, level }, index) => {
    __p += " ";
    if (level > currentLevel) {
      __p += " <ul>";
    }
    __p += ' <li class="chaptertype-1"><a href="page-' + __e(index) + '.html"><span class="toc-chapter-title">' + __e(title) + "</span></a></li>";
    if (level < currentLevel) {
      __p += " ";
      for (let i = currentLevel; i > level; i--) {
        __p += " </ul>";
      }
      __p += " ";
    }
    __p += " ";
    currentLevel = level;
    __p += " ";
  });
  __p += " ";
  if (currentLevel > 0) {
    __p += " ";
    for (let i = currentLevel; i > 0; i--) {
      __p += " </ul>";
    }
    __p += " ";
  }
  __p += " </ul></div></body></html>";
  return __p;
}
function escapeFallback$2(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s == null ? "" : String(s).replace(/[&<>"']/g, function(c) {
    return m[c];
  });
}
function renderInfo(data) {
  var __t, __p = "", __e = escapeFallback$2;
  __p += '<?xml version="1.0" encoding="UTF-8" ?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="' + __e(data.i18n.code) + '"><head><title>' + __e(data.i18n.info) + '</title><meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8"/></head><body><div id="title-page"><h1 class="title">' + __e(data.title) + '</h1><h2 class="subtitle"></h2><h3 class="author">' + __e(data.author) + '</h3><h4 class="publisher">' + __e(data.publisher) + "</h4></div>";
  if (Array.isArray(data.tags) && data.tags.length) {
    __p += ' <div class="part-title-wrap">';
    const tags = data.tags.join("</code>, <code>");
    __p += " <code>" + ((__t = tags) == null ? "" : __t) + "</code></div>";
  }
  __p += " ";
  if (data.description) {
    __p += ' <div class="ugc">' + ((__t = data.description) == null ? "" : __t) + " </div>";
  }
  __p += " </body></html>";
  return __p;
}
function escapeFallback$1(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s == null ? "" : String(s).replace(/[&<>"']/g, function(c) {
    return m[c];
  });
}
function renderBookConfig(data) {
  var __p = "", __e = escapeFallback$1;
  __p += '<?xml version="1.0" encoding="UTF-8" ?>\n<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="PrimaryID"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:title>' + __e(data.title) + "</dc:title><dc:language>" + __e(data.i18n.code) + '</dc:language><dc:identifier id="PrimaryID" opf:scheme="' + __e(data.uuid.scheme) + '">' + __e(data.uuid.id) + '</dc:identifier><dc:date opf:event="publication">' + __e(data.date) + "</dc:date>";
  if (data.description) {
    __p += " <dc:description>" + __e(data.description) + "</dc:description>";
  }
  __p += ' <dc:creator opf:role="aut">' + __e(data.author) + "</dc:creator><dc:publisher>" + __e(data.publisher) + "</dc:publisher>";
  if (data.cover) {
    __p += ' <meta name="cover" content="cover-image"/>';
  }
  __p += " ";
  if (Array.isArray(data.tags) && data.tags.length) data.tags.forEach((tag) => {
    __p += " <dc:subject>" + __e(tag) + "</dc:subject>";
  });
  __p += " </metadata><manifest>";
  if (data.cover) {
    __p += ' <item id="front-cover" href="OEBPS/front-cover.html" media-type="application/xhtml+xml"/>';
  }
  __p += ' <item id="title-page" href="OEBPS/title-page.html" media-type="application/xhtml+xml"/>';
  if (data.notes) {
    __p += ' <item id="notes" href="OEBPS/notes.html" media-type="application/xhtml+xml"/>';
  }
  __p += ' <item id="table-of-contents" href="OEBPS/table-of-contents.html" media-type="application/xhtml+xml"/>';
  data.pages.forEach((page, index) => {
    __p += ' <item id="page-' + __e(index) + '" href="OEBPS/page-' + __e(index) + '.html" media-type="application/xhtml+xml"/>';
  });
  __p += " ";
  if (data.cover) {
    __p += ' <item id="cover-image" href="' + __e(data.cover.path) + '" media-type="' + __e(data.cover.type) + '"/>';
  }
  __p += ' <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>';
  Object.keys(data.images).forEach((name) => {
    __p += ' <item id="' + __e(name) + '" href="OEBPS/' + __e(data.images[name].path) + '" media-type="' + __e(data.images[name].type) + '"/>';
  });
  __p += ' </manifest><spine toc="ncx">';
  if (data.cover) {
    __p += ' <itemref idref="front-cover" linear="no"/>';
  }
  __p += ' <itemref idref="title-page" linear="yes"/><itemref idref="table-of-contents" linear="yes"/>';
  data.pages.forEach((page, index) => {
    __p += ' <itemref idref="page-' + __e(index) + '" linear="yes"/>';
  });
  __p += " ";
  if (data.notes) {
    __p += ' <itemref idref="notes" linear="yes"/>';
  }
  __p += " </spine><guide>";
  if (data.cover) {
    __p += ' <reference type="cover" title="' + __e(data.i18n.cover) + '" href="OEBPS/front-cover.html"/>';
  }
  __p += ' <reference type="toc" title="' + __e(data.i18n.toc) + '" href="OEBPS/table-of-contents.html"/></guide></package>';
  return __p;
}
function escapeFallback(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s == null ? "" : String(s).replace(/[&<>"']/g, function(c) {
    return m[c];
  });
}
function renderToc(data) {
  var __p = "", __e = escapeFallback;
  __p += '<?xml version="1.0" encoding="UTF-8" ?>\n<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx version="2005-1" xml:lang="' + __e(data.i18n.code) + '" xmlns="http://www.daisy.org/z3986/2005/ncx/"><head><meta name="dtb:uid" content="' + __e(data.uuid.id) + '"/><meta name="dtb:depth" content="2"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>' + __e(data.title) + "</text></docTitle><docAuthor><text>" + __e(data.author) + '</text></docAuthor><navMap><navPoint id="title-page" playOrder="1"><navLabel><text>' + __e(data.i18n.info) + '</text></navLabel><content src="OEBPS/title-page.html"/></navPoint><navPoint id="table-of-contents" playOrder="2"><navLabel><text>' + __e(data.i18n.toc) + '</text></navLabel><content src="OEBPS/table-of-contents.html"/></navPoint>';
  let currentLevel = -1;
  __p += " ";
  data.pages.forEach(({ title, level }, index) => {
    __p += " ";
    if (level <= currentLevel) {
      __p += " ";
      for (let i = currentLevel; i >= level; i--) {
        __p += " </navPoint>";
      }
      __p += " ";
    }
    __p += ' <navPoint id="page-' + __e(index) + '" playOrder="' + __e(index + 3) + '"><navLabel><text>' + __e(title) + '</text></navLabel><content src="OEBPS/page-' + __e(index) + '.html"/>';
    currentLevel = level;
    __p += " ";
  });
  __p += " ";
  if (currentLevel >= 0) {
    __p += " ";
    for (let i = currentLevel; i >= 0; i--) {
      __p += " </navPoint>";
    }
    __p += " ";
  }
  __p += " ";
  if (data.notes) {
    __p += ' <navPoint id="notes-page" playOrder="2"><navLabel><text>' + __e(data.i18n.note) + '</text></navLabel><content src="OEBPS/notes.html"/></navPoint>';
  }
  __p += " </navMap></ncx>";
  return __p;
}
class jEpub {
  constructor() {
    this._I18n = {};
    this._Info = {};
    this._Uuid = {};
    this._Date = null;
    this._Cover = null;
    this._Pages = [];
    this._Images = [];
    this._Zip = {};
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
        i18n: "en",
        title: "undefined",
        author: "undefined",
        publisher: "undefined",
        description: "",
        tags: []
      },
      details
    );
    this._Uuid = {
      scheme: "uuid",
      id: uuidv4()
    };
    this._Date = getISODate();
    if (!language[this._Info.i18n])
      throw `Unknown Language: ${this._Info.i18n}`;
    this._I18n = language[this._Info.i18n];
    this._Zip = {};
    this._Zip["mimetype"] = mime;
    this._Zip["META-INF/container.xml"] = container;
    this._Zip["OEBPS/title-page.html"] = renderInfo({
      i18n: this._I18n,
      title: this._Info.title,
      author: this._Info.author,
      publisher: this._Info.publisher,
      description: parseDOM(this._Info.description),
      tags: this._Info.tags
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
    return html2text(html, noBr);
  }
  /**
   * Set the publication date
   * @param {Date} date - Date object for the publication
   * @returns {jEpub} - Returns this instance for method chaining
   * @throws {string} - Throws error if date is not valid
   */
  date(date) {
    if (date instanceof Date) {
      this._Date = getISODate(date);
      return this;
    } else {
      throw "Date object is not valid";
    }
  }
  /**
   * Set the UUID for the book
   * @param {string} id - UUID string or URL
   * @returns {jEpub} - Returns this instance for method chaining
   * @throws {string} - Throws error if UUID is empty
   */
  uuid(id) {
    if (isEmpty(id)) {
      throw "UUID value is empty";
    } else {
      let scheme = "uuid";
      if (validateUrl(id)) scheme = "URI";
      this._Uuid = {
        scheme,
        id
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
    let ext, mime2;
    if (data instanceof Blob) {
      mime2 = data.type;
      ext = mime2ext(mime2);
    } else if (data instanceof ArrayBuffer) {
      ext = detectImageType(new Uint8Array(data));
      if (ext) {
        mime2 = ext.mime;
        ext = mime2ext(mime2);
      }
    } else {
      throw "Cover data is not valid";
    }
    if (!ext) throw "Cover data is not allowed";
    this._Cover = {
      type: mime2,
      path: `OEBPS/cover-image.${ext}`
    };
    this._Zip[this._Cover.path] = data;
    this._Zip["OEBPS/front-cover.html"] = renderCover({
      i18n: this._I18n,
      cover: this._Cover
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
    let ext, mime2;
    if (data instanceof Blob) {
      mime2 = data.type;
      ext = mime2ext(mime2);
    } else if (data instanceof ArrayBuffer) {
      ext = detectImageType(new Uint8Array(data));
      mime2 = ext.mime;
      if (ext) ext = mime2ext(mime2);
    } else {
      throw "Image data is not valid";
    }
    if (!ext) throw "Image data is not allowed";
    const filePath = `assets/${name}.${ext}`;
    this._Images[name] = {
      type: mime2,
      path: filePath
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
    if (isEmpty(content)) {
      throw "Notes is empty";
    } else {
      this._Zip["OEBPS/notes.html"] = renderNotes({
        i18n: this._I18n,
        notes: parseDOM(content)
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
    if (isEmpty(title)) {
      throw "Title is empty";
    }
    if (typeof level !== "number" || isNaN(level) || level < 0) {
      throw "Level must be a non-negative number";
    }
    const lastPage = this._Pages[this._Pages.length - 1];
    if (lastPage && level > lastPage.level + 1) {
      throw `Invalid TOC hierarchy: Level can only increase by 1 (from ${lastPage.level} to ${lastPage.level + 1})`;
    }
    if (content && !Array.isArray(content)) {
      const images = this._Images;
      const fallback = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
      content = content.replace(/<%=[\s]*image\[['"]([\S]*?)['"]\][\s]*%>/g, (_, expr) => {
        const img = images[expr.trim()];
        return `<img src="${img ? img.path : fallback}" alt=""></img>`;
      });
      content = parseDOM(content);
    }
    const pageId = this._Pages.length;
    this._Zip[`OEBPS/page-${pageId}.html`] = renderPage({
      i18n: this._I18n,
      title,
      content
    });
    this._Pages.push({
      title,
      level
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
  generate(type = "blob", onUpdate) {
    const supported = /* @__PURE__ */ new Set(["blob", "arraybuffer", "uint8array", "base64"]);
    if (!supported.has(type)) throw `This browser does not support ${type}`;
    const notes = "OEBPS/notes.html" in this._Zip;
    this._Zip["book.opf"] = renderBookConfig({
      i18n: this._I18n,
      uuid: this._Uuid,
      date: this._Date,
      title: this._Info.title,
      author: this._Info.author,
      publisher: this._Info.publisher,
      description: html2text(this._Info.description, true),
      tags: this._Info.tags,
      cover: this._Cover,
      pages: this._Pages,
      notes,
      images: this._Images
    });
    this._Zip["OEBPS/table-of-contents.html"] = renderTocInBook({
      i18n: this._I18n,
      pages: this._Pages
    });
    this._Zip["toc.ncx"] = renderToc({
      i18n: this._I18n,
      uuid: this._Uuid,
      title: this._Info.title,
      author: this._Info.author,
      pages: this._Pages,
      notes
    });
    return (async () => {
      const fflateFiles = {};
      for (const [path, content] of Object.entries(this._Zip)) {
        let data;
        if (typeof content === "string") {
          data = strToU8(content);
        } else if (content instanceof Blob) {
          data = new Uint8Array(await content.arrayBuffer());
        } else if (content instanceof ArrayBuffer) {
          data = new Uint8Array(content);
        } else {
          data = content;
        }
        fflateFiles[path] = path === "mimetype" ? [data, { level: 0 }] : [data, { level: 9 }];
      }
      return new Promise((resolve, reject) => {
        zip(fflateFiles, (err, data) => {
          if (err) {
            return reject(err);
          }
          if (onUpdate) {
            onUpdate({ percent: 100 });
          }
          if (type === "uint8array") {
            return resolve(data);
          }
          if (type === "arraybuffer") {
            return resolve(data.buffer);
          }
          if (type === "base64") {
            if (typeof globalThis.btoa !== "undefined") {
              return resolve(globalThis.btoa(Array.from(data, (b) => String.fromCharCode(b)).join("")));
            }
            return globalThis.Buffer.from(data).toString("base64");
          }
          resolve(new Blob([data], { type: mime }));
        });
      });
    })();
  }
}
export {
  jEpub as default
};
//# sourceMappingURL=jepub.es.js.map

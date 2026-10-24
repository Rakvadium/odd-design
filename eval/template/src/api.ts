export type Filter = "all" | "unread" | "read";
export type Article = { id: string; url: string; title: string; site: string; savedAt: string; read: boolean };
export type Page = { items: Article[]; nextCursor: string | null };

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const packed = [
  "www.theatlantic.com|Margins on a paper page|0|23;www.newyorker.com|A shelf of borrowed novels|1|22;www.nytimes.com|Quiet rooms and open books|0|21;www.theguardian.com|Notes in a worn paperback|0|20",
  "longreads.com|Lamps for night reading|1|19;www.lrb.co.uk|Ink that stays on the thumb|0|18;aeon.co|Why reread a short novel|0|17;www.poetryfoundation.org|A line break you can hear|1|16",
  "www.publicbooks.org|City libraries after dark|0|15;electricliterature.com|Reading in a small kitchen|0|14;themillions.com|An index of dog-eared pages|1|13;www.bookforum.com|Paper that smells like rain|0|12",
  "www.theparisreview.org|Pencil marks in chapter two|0|11;lithub.com|Sentences with room to breathe|1|10;www.vqronline.org|A river story in one sitting|0|09;granta.com|Four essays on winter light|0|08",
  "www.harpers.org|Chairs by a shop window|1|07;www.believermag.com|A pocket dictionary of birds|0|06;orionmagazine.org|Field notes from a long walk|0|05;www.wired.com|Pages that turn like a book|1|04",
  "www.atlasobscura.com|Maps folded into a novel|0|03;www.smithsonianmag.com|The press on a side street|0|02;www.bbc.com|Covers in a station shop|1|01",
];

const articles: Article[] = packed.join(";").split(";").map((row, index) => {
  const [host, title, read, day] = row.split("|");
  return {
    id: String(index + 1),
    url: `https://${host}/story`,
    title: title ?? "",
    site: host ?? "",
    savedAt: `2026-10-${day}T18:00:00.000Z`,
    read: read === "1",
  };
});

let nextId = articles.length + 1;
let calls = 0;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const copy = (article: Article): Article => ({ ...article });

function included(article: Article, filter: Filter): boolean {
  switch (filter) {
    case "all": return true;
    case "unread": return !article.read;
    case "read": return article.read;
    default: { const unreachable: never = filter; return unreachable; }
  }
}
function httpUrl(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new ApiError(422, "Enter an http or https URL."); }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new ApiError(422, "Enter an http or https URL.");
  return url;
}

async function settle<T>(produce: () => T): Promise<T> {
  calls += 1;
  const slow = calls % 8 === 0;
  await wait((slow ? 2500 : 250) + Math.random() * (slow ? 1500 : 650));
  if (calls % 7 === 0) throw new ApiError(503, "The server is down.");
  return produce();
}

export function listArticles(filter: Filter, cursor?: string): Promise<Page> {
  return settle(() => {
    const start = cursor === undefined ? 0 : Number(cursor);
    const index = Number.isInteger(start) && start >= 0 ? start : 0;
    const ordered = articles.filter((article) => included(article, filter)).sort((left, right) => (left.savedAt < right.savedAt ? 1 : left.savedAt > right.savedAt ? -1 : 0));
    const items = ordered.slice(index, index + 10).map(copy);
    return { items, nextCursor: index + 10 < ordered.length ? String(index + 10) : null };
  });
}

export function addArticle(input: { url: string; title: string }): Promise<Article> {
  return settle(() => {
    const url = httpUrl(input.url);
    const title = input.title.trim();
    if (title === "") throw new ApiError(422, "Enter a title.");
    const article: Article = { id: String(nextId), url: url.toString(), title, site: url.hostname, savedAt: new Date().toISOString(), read: false };
    nextId += 1;
    articles.unshift(article);
    return copy(article);
  });
}

export function setRead(id: string, read: boolean): Promise<Article> {
  return settle(() => {
    const article = articles.find((item) => item.id === id);
    if (article === undefined) throw new ApiError(404, "No such article.");
    article.read = read;
    return copy(article);
  });
}

export function deleteArticle(id: string): Promise<void> {
  return settle(() => {
    const index = articles.findIndex((item) => item.id === id);
    if (index === -1) throw new ApiError(404, "No such article.");
    articles.splice(index, 1);
  });
}

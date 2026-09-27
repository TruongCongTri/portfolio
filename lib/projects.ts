import type { StaticImageData } from 'next/image';
import type { Locale } from './i18n/config';
import type { Dictionary } from './i18n/dictionaries';

/*
 * Project screenshots live in public/projects/<slug>/, numbered in display order:
 *
 *   public/projects/chinh-nam-portfolio/hero.png ← full-bleed image in the detail page's hero
 *   public/projects/chinh-nam-portfolio/01.png   ← cover (grid card, hover preview, share card)
 *   public/projects/chinh-nam-portfolio/02.png   ← gallery continues in number order…
 *
 * Import them here (static imports give Next each file's size, a blur placeholder and a
 * cache-forever URL; next/image then serves resized AVIF/WebP, so large PNG sources are fine).
 */
import chinhNamHero from '../public/projects/chinh-nam-portfolio/hero.png';
import chinhNam01 from '../public/projects/chinh-nam-portfolio/01.png';
import chinhNam02 from '../public/projects/chinh-nam-portfolio/02.png';
import chinhNam03 from '../public/projects/chinh-nam-portfolio/03.png';
import chinhNam04 from '../public/projects/chinh-nam-portfolio/04.png';
import chinhNam05 from '../public/projects/chinh-nam-portfolio/05.png';

/** A statically imported screenshot, or a remote URL (the placeholders). */
export type ProjectImage = StaticImageData | string;

/** URL of a project image (for metadata, JSON-LD, keys). */
export const imageUrl = (image: ProjectImage) => (typeof image === 'string' ? image : image.src);

/** Blurred preview while loading — only local imports have one. */
export const blurPlaceholder = (image: ProjectImage) => (typeof image === 'string' ? 'empty' : 'blur');

export type CategoryId = keyof Dictionary['work']['categories'];

type LocalizedCopy = {
  services: string;
  /** One sentence: shown as the "{Project} — {overview}" headline. */
  overview: string;
  /** Paragraphs under "Challenge". */
  challenge: string[];
  /** Paragraphs under "Approach". */
  approach: string[];
};

type ProjectSource = {
  slug: string;
  title: string;
  /**
   * The title split into [name, site type], e.g. ['Chinh Nam', 'ERP']. When the hero title is too
   * long for one line it breaks between the two parts, never inside either. Omit to keep it whole.
   */
  titleParts?: [string, string];
  category: CategoryId;
  year: string;
  /** Brand color: the detail page's background, card backgrounds and hand-off gradient. */
  color: string;
  /** Whether text on `color` should be light or dark (ignored when `textColor` is set). */
  tone: 'light' | 'dark';
  /** Explicit brand text color (hex), for projects with a signature text color. */
  textColor?: string;
  /** Live site, opened from the cover image and the "View live" button. */
  url?: string;
  /** Detail page hero image (public/projects/<slug>/hero.png); falls back to the cover. */
  hero?: ProjectImage;
  /** Display order; the first is the cover. */
  images: ProjectImage[];
  copy: Record<Locale, LocalizedCopy>;
};

/** A project with its copy resolved for one locale. */
export type Project = Omit<ProjectSource, 'copy'> & LocalizedCopy;

/** Placeholder screens tinted with the project colors — swap for real screenshots. */
function placeholderShots(title: string, color: string, count: number, textColor = '#ffffff') {
  const label = encodeURIComponent(title).replace(/%20/g, '+');
  return Array.from(
    { length: count },
    (_, i) =>
      `https://placehold.co/1600x1000/${color.slice(1)}/${textColor.slice(1)}/png?text=${label}+${i + 1}&font=montserrat`,
  );
}

// TODO: confirm each project's year and add `url` once the live sites are public.
const sources: ProjectSource[] = [
  {
    slug: 'chinh-nam-portfolio',
    title: 'Chinh Nam Portfolio',
    titleParts: ['Chinh Nam', 'Portfolio'],
    category: 'corporate',
    year: '2026',
    url: "https://chinhnam-web.onrender.com/",
    color: '#0e58cf',
    tone: 'light',
    hero: chinhNamHero,
    images: [chinhNam01, chinhNam02, chinhNam03, chinhNam04, chinhNam05],
    copy: {
      en: {
        services: 'Design + Development',
        overview:
          'A company site for Chinh Nam that tells the story of its ethics, culture and work through scroll-driven motion.',
        challenge: [
          "Chinh Nam’s values and culture were written down in documents and presentations, but a list of values doesn’t show visitors what working with the company is actually like.",
          "The site had to carry three stories at once — the ethics the company stands by, the culture inside it and the work it delivers — without turning into a long, static corporate page.",
        ],
        approach: [
          "We structured the site as a sequence of scroll-driven chapters built with Next.js and modern GSAP. ScrollTrigger pins the key moments, text reveals set the reading pace, and transitions carry visitors from one chapter to the next.",
          "The brand blue runs through every section as the connecting thread, and the motion stays purposeful: it draws attention to the ideas and the work instead of decorating the page.",
        ],
      },
      vi: {
        services: 'Thiết kế + Phát triển',
        overview:
          'Website doanh nghiệp cho Chinh Nam, kể câu chuyện về đạo đức, văn hóa và dự án của công ty qua chuyển động theo cuộn trang.',
        challenge: [
          "Giá trị và văn hóa của Chinh Nam được ghi lại trong tài liệu và bài thuyết trình, nhưng một danh sách giá trị không cho người xem thấy làm việc cùng công ty thực sự như thế nào.",
          "Website phải kể cùng lúc ba câu chuyện — đạo đức mà công ty theo đuổi, văn hóa bên trong và những dự án đã thực hiện — mà không biến thành một trang doanh nghiệp dài và tĩnh.",
        ],
        approach: [
          "Chúng tôi xây dựng website thành chuỗi chương kể chuyện theo cuộn trang bằng Next.js và GSAP hiện đại. ScrollTrigger ghim lại những khoảnh khắc quan trọng, chữ hiện dần điều chỉnh nhịp đọc và các chuyển cảnh đưa người xem từ chương này sang chương khác.",
          "Màu xanh thương hiệu xuyên suốt mọi phần như sợi chỉ kết nối, còn chuyển động luôn có chủ đích: dẫn sự chú ý đến ý tưởng và dự án thay vì chỉ để trang trí.",
        ],
      },
    },
  },
  {
    slug: 'chinh-nam-erp',
    title: 'Chinh Nam ERP',
    titleParts: ['Chinh Nam', 'ERP'],
    category: 'enterprise',
    year: '2026',
    // No brand color given — a neutral slate to set the internal tool apart from the public site.
    color: '#2b313c',
    tone: 'light',
    images: placeholderShots('Chinh Nam ERP', '#2b313c', 4),
    copy: {
      en: {
        services: 'Full-stack Development',
        overview: 'An internal ERP that runs Chinh Nam’s day-to-day operations on an enterprise resource planning model.',
        challenge: [
          "Day-to-day operations were spread across separate tools and spreadsheets, so the same information was entered in several places and quickly fell out of sync.",
          "Managers had no single place to see the state of the company, and every change depended on someone remembering to update the right file.",
        ],
        approach: [
          "We built an internal ERP on the enterprise resource planning model: a Next.js front end with Redux for application state, on a NestJS back end organised into modules that mirror how the company works.",
          "Redis keeps frequently used data fast, WebSockets push changes to everyone the moment they happen, and webhooks connect the system with outside services, so every department works from the same up-to-date data.",
        ],
      },
      vi: {
        services: 'Phát triển Full-stack',
        overview: 'Hệ thống ERP nội bộ vận hành công việc hằng ngày của Chinh Nam theo mô hình quản trị nguồn lực doanh nghiệp.',
        challenge: [
          "Công việc hằng ngày nằm rải rác trên nhiều công cụ và bảng tính riêng lẻ, cùng một thông tin phải nhập ở nhiều nơi và nhanh chóng trở nên lệch nhau.",
          "Người quản lý không có một nơi duy nhất để nắm tình hình công ty, và mọi thay đổi đều phụ thuộc vào việc có người nhớ cập nhật đúng tệp.",
        ],
        approach: [
          "Chúng tôi xây dựng hệ thống ERP nội bộ theo mô hình quản trị nguồn lực doanh nghiệp: frontend Next.js dùng Redux quản lý trạng thái, trên backend NestJS được tổ chức thành các module phản ánh cách công ty vận hành.",
          "Redis giúp dữ liệu dùng thường xuyên luôn nhanh, WebSocket đẩy thay đổi đến mọi người ngay khi xảy ra, và webhook kết nối hệ thống với các dịch vụ bên ngoài, để mọi phòng ban cùng làm việc trên một nguồn dữ liệu luôn cập nhật.",
        ],
      },
    },
  },
  {
    slug: 'vietdynamic-elearning',
    title: 'VietDynamic E-learning',
    titleParts: ['VietDynamic', 'E-learning'],
    category: 'eLearning',
    year: '2025',
    color: '#ba0027',
    tone: 'light',
    images: placeholderShots('VietDynamic', '#ba0027', 4),
    copy: {
      en: {
        services: 'Full-stack Development',
        overview: 'An e-learning platform with video streaming, a course store and online payments.',
        challenge: [
          "Learners expect lessons to start instantly and play smoothly, whatever their device or connection.",
          "At the same time, the platform had to sell courses and take payments online, and course access had to follow payments reliably, with no manual reconciliation.",
        ],
        approach: [
          "A Next.js front end with Redux handles the catalogue, checkout and learning experience, backed by an Express.js API. Lessons are streamed rather than downloaded, so learners can start watching straight away.",
          "Redis caches catalogue data and sessions, WebSockets power the real-time features, and payment webhooks confirm each transaction and unlock the purchased course automatically.",
        ],
      },
      vi: {
        services: 'Phát triển Full-stack',
        overview: 'Nền tảng học trực tuyến với phát video trực tuyến, cửa hàng khóa học và thanh toán online.',
        challenge: [
          "Người học mong bài giảng bắt đầu ngay lập tức và phát mượt mà, bất kể thiết bị hay tốc độ mạng.",
          "Đồng thời, nền tảng phải bán khóa học và nhận thanh toán trực tuyến, và quyền truy cập khóa học phải đi theo thanh toán một cách chính xác, không cần đối soát thủ công.",
        ],
        approach: [
          "Frontend Next.js cùng Redux đảm nhận danh mục khóa học, thanh toán và trải nghiệm học, với API Express.js phía sau. Bài giảng được phát trực tuyến thay vì tải xuống, nên người học có thể xem ngay.",
          "Redis lưu cache danh mục và phiên đăng nhập, WebSocket vận hành các tính năng thời gian thực, và webhook thanh toán xác nhận từng giao dịch rồi tự động mở khóa khóa học đã mua.",
        ],
      },
    },
  },
  {
    slug: 'airport-digital-twin',
    title: 'Airport Digital Twin',
    titleParts: ['Airport', 'Digital Twin'],
    category: 'digitalTwin',
    year: '2025',
    // No brand color given — a deep aviation teal.
    color: '#0d5c63',
    tone: 'light',
    images: placeholderShots('Airport Digital Twin', '#0d5c63', 4),
    copy: {
      en: {
        services: 'Full-stack Development',
        overview:
          'A digital twin platform that models airports and tracks live ground aircraft and sensors, both indoors and outdoors.',
        challenge: [
          "An airport produces a constant stream of data: aircraft moving across the airfield and sensors reporting from inside the terminals as well as outdoors.",
          "Operators needed all of it on one accurate model of each airport, updating in real time, instead of scattered across separate systems.",
        ],
        approach: [
          "We built the twin on ArcGIS, with a Next.js and Redux front end that renders each airport’s model and places live aircraft and sensor readings in context, indoors and out.",
          "An Express.js back end ingests sensor events through webhooks, keeps fast-changing state in Redis and streams updates to every open view over WebSockets, so the model reflects what is happening on the ground.",
        ],
      },
      vi: {
        services: 'Phát triển Full-stack',
        overview:
          'Nền tảng bản sao số mô hình hóa sân bay, theo dõi trực tiếp máy bay dưới mặt đất và cảm biến trong nhà lẫn ngoài trời.',
        challenge: [
          "Một sân bay tạo ra luồng dữ liệu liên tục: máy bay di chuyển trên sân đỗ và cảm biến báo về từ bên trong nhà ga lẫn ngoài trời.",
          "Người vận hành cần tất cả dữ liệu đó trên một mô hình chính xác của từng sân bay, cập nhật theo thời gian thực, thay vì nằm rải rác trên nhiều hệ thống.",
        ],
        approach: [
          "Chúng tôi xây dựng bản sao số trên ArcGIS, với frontend Next.js và Redux hiển thị mô hình từng sân bay, đặt máy bay và số liệu cảm biến trực tiếp vào đúng vị trí, cả trong nhà lẫn ngoài trời.",
          "Backend Express.js tiếp nhận sự kiện cảm biến qua webhook, lưu trạng thái thay đổi nhanh trong Redis và truyền cập nhật đến mọi màn hình đang mở qua WebSocket, để mô hình luôn phản ánh những gì đang diễn ra dưới mặt đất.",
        ],
      },
    },
  },
  {
    slug: 'digital-twin',
    title: 'Digital Twin',
    category: 'digitalTwin',
    year: '2025',
    color: '#002244',
    tone: 'light',
    textColor: '#b3995d',
    images: placeholderShots('Digital Twin', '#002244', 4, '#b3995d'),
    copy: {
      en: {
        services: 'Full-stack Development',
        overview:
          'A 3D digital twin platform for the Vietnam Aerospace University, where students upload building models to explore.',
        challenge: [
          "Students at the Vietnam Aerospace University create 3D models of buildings, but a full model is hard to study: there is too much on screen at once.",
          "Viewers needed to explore each building level by level, separate its architectural and structural systems, follow its construction phases, and see it under different weather conditions and basemaps.",
        ],
        approach: [
          "Students upload their building models to the platform, which presents them as ArcGIS scenes in a Next.js and Redux front end.",
          "Filters isolate a level, switch between architectural and structural views, step through construction phases and change the weather and basemap, while an Express.js back end with Redis, WebSockets and webhooks keeps uploads and views in sync.",
        ],
      },
      vi: {
        services: 'Phát triển Full-stack',
        overview:
          'Nền tảng bản sao số 3D cho Trường Đại học Hàng không Vũ trụ Việt Nam, nơi sinh viên tải lên mô hình công trình để khám phá.',
        challenge: [
          "Sinh viên Trường Đại học Hàng không Vũ trụ Việt Nam tạo mô hình 3D của các công trình, nhưng một mô hình đầy đủ rất khó nghiên cứu vì có quá nhiều thông tin trên màn hình cùng lúc.",
          "Người xem cần khám phá từng công trình theo từng tầng, tách riêng hệ kiến trúc và kết cấu, theo dõi các giai đoạn thi công, và xem công trình trong các điều kiện thời tiết và bản đồ nền khác nhau.",
        ],
        approach: [
          "Sinh viên tải mô hình công trình lên nền tảng, nơi chúng được hiển thị dưới dạng cảnh ArcGIS trong frontend Next.js và Redux.",
          "Bộ lọc giúp tách riêng từng tầng, chuyển giữa góc nhìn kiến trúc và kết cấu, xem lần lượt các giai đoạn thi công, đổi thời tiết và bản đồ nền, trong khi backend Express.js với Redis, WebSocket và webhook giữ cho mô hình tải lên và các chế độ xem luôn đồng bộ.",
        ],
      },
    },
  },
];

function localize({ copy, ...project }: ProjectSource, locale: Locale): Project {
  return { ...project, ...copy[locale] };
}

export const projectSlugs = sources.map((p) => p.slug);

export const categoryIds = [...new Set(sources.map((p) => p.category))];

export function getProjects(locale: Locale) {
  return sources.map((p) => localize(p, locale));
}

/** The `count` most recent projects (by year; list order breaks ties, so newest-first within a year). */
export function getLatestProjects(locale: Locale, count: number) {
  return sources
    .map((source, index) => ({ source, index }))
    .sort((a, b) => Number(b.source.year) - Number(a.source.year) || a.index - b.index)
    .slice(0, count)
    .map(({ source }) => localize(source, locale));
}

export function getProject(slug: string, locale: Locale) {
  const source = sources.find((p) => p.slug === slug);
  return source && localize(source, locale);
}

/** Previous/next project, wrapping around the ends of the list. */
export function getAdjacentProjects(slug: string, locale: Locale) {
  const index = sources.findIndex((p) => p.slug === slug);
  const count = sources.length;
  return {
    prev: localize(sources[(index - 1 + count) % count], locale),
    next: localize(sources[(index + 1) % count], locale),
  };
}

/**
 * The color tokens (see globals.css) for a page or section painted in a project's brand color.
 * Derived tokens are listed explicitly because custom properties resolve where they're declared:
 * overriding --color-fg-rgb alone wouldn't update --color-fg on descendants.
 */
export function projectPalette(project: Pick<Project, 'color' | 'tone' | 'textColor'>): Record<string, string> {
  const fg = project.textColor
    ? hexToChannels(project.textColor)
    : project.tone === 'light'
      ? '245 245 245'
      : '22 22 22';
  // Text on filled buttons sits on `fg`, so it takes the page color when the brand has its own text color.
  const inverseFg = project.textColor ? project.color : project.tone === 'light' ? '#161616' : '#f5f5f5';
  // A band that must stand apart from the page (the gallery): lighter on dark brand colors,
  // darker on light ones, so it reads as the same project but a distinct section.
  const section = `color-mix(in srgb, ${project.color} 86%, ${project.tone === 'light' ? 'white' : 'black'})`;
  return {
    '--color-bg': project.color,
    '--color-section': section,
    '--color-fg-rgb': fg,
    '--color-fg': `rgb(${fg})`,
    '--color-muted': `rgb(${fg} / 0.6)`,
    '--color-soft': `rgb(${fg} / 0.7)`,
    '--color-subtle': `rgb(${fg} / 0.75)`,
    '--color-lead': `rgb(${fg} / 0.9)`,
    '--color-hover': `rgb(${fg} / 0.65)`,
    '--color-border': `rgb(${fg} / 0.18)`,
    '--color-border-faint': `rgb(${fg} / 0.1)`,
    '--color-border-strong': `rgb(${fg} / 0.35)`,
    '--color-inverse-bg': `rgb(${fg})`,
    '--color-inverse-fg': inverseFg,
    '--color-placeholder': `rgb(0 0 0 / 0.22)`,
  };
}

/** '#b3995d' → '179 153 93' (space-separated channels for rgb(... / alpha)). */
function hexToChannels(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

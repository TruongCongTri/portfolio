import type { Locale } from './i18n/config';
import type { Dictionary } from './i18n/dictionaries';

export type CategoryId = keyof Dictionary['work']['categories'];

type LocalizedCopy = {
  services: string;
  overview: string;
  challenge: string;
  approach: string;
};

type ProjectSource = {
  slug: string;
  title: string;
  category: CategoryId;
  year: string;
  /** Brand color: the detail page's background, card backgrounds and hand-off gradient. */
  color: string;
  /** Whether text on `color` should be light or dark. */
  tone: 'light' | 'dark';
  /** Live site, opened from the cover image. */
  url?: string;
  images: string[];
  copy: Record<Locale, LocalizedCopy>;
};

/** A project with its copy resolved for one locale. */
export type Project = Omit<ProjectSource, 'copy'> & LocalizedCopy;

/** Placeholder screens tinted with the project color — swap for real screenshots. */
function placeholderShots(title: string, color: string, count: number) {
  const hex = color.slice(1);
  const label = encodeURIComponent(title).replace(/%20/g, '+');
  return Array.from(
    { length: count },
    (_, i) => `https://placehold.co/1600x1000/${hex}/ffffff/png?text=${label}+${i + 1}&font=montserrat`,
  );
}

// Sample projects (fictional) — replace with your own work.
const sources: ProjectSource[] = [
  {
    slug: 'northwind',
    title: 'Northwind',
    category: 'fintech',
    year: '2026',
    color: '#15151d',
    tone: 'light',
    url: 'https://example.com',
    images: placeholderShots('Northwind', '#15151d', 4),
    copy: {
      en: {
        services: 'Design + Development',
        overview: 'A treasury dashboard that turns a company’s cash flow into a calm, readable daily briefing.',
        challenge:
          'Finance teams juggled five tools and a spreadsheet to answer one question: how much runway do we have today?',
        approach:
          'One timeline view with forecast bands, keyboard-first navigation and numbers that animate only when they change.',
      },
      vi: {
        services: 'Thiết kế + Phát triển',
        overview: 'Bảng điều khiển ngân quỹ biến dòng tiền của doanh nghiệp thành bản tóm tắt hằng ngày dễ đọc.',
        challenge:
          'Đội tài chính phải dùng năm công cụ và một bảng tính chỉ để trả lời: hôm nay công ty còn trụ được bao lâu?',
        approach:
          'Một dòng thời gian duy nhất với dải dự báo, điều hướng bằng bàn phím và số liệu chỉ chuyển động khi thay đổi.',
      },
    },
  },
  {
    slug: 'lumen-studio',
    title: 'Lumen Studio',
    category: 'architecture',
    year: '2025',
    color: '#8c0c22',
    tone: 'light',
    url: 'https://example.com',
    images: placeholderShots('Lumen Studio', '#8c0c22', 3),
    copy: {
      en: {
        services: 'Design + Development',
        overview: 'A portfolio site for an architecture practice where every project reads like a printed monograph.',
        challenge: 'Large photography had to feel immersive without slowing the site down on hotel Wi-Fi.',
        approach:
          'Responsive image pipelines, typographic layouts per project and page transitions that keep the reader oriented.',
      },
      vi: {
        services: 'Thiết kế + Phát triển',
        overview: 'Website giới thiệu cho một văn phòng kiến trúc, mỗi dự án được trình bày như một ấn phẩm in.',
        challenge: 'Ảnh khổ lớn phải thật cuốn hút mà không làm chậm trang khi dùng mạng yếu.',
        approach:
          'Quy trình ảnh responsive, bố cục chữ riêng cho từng dự án và chuyển trang giúp người đọc luôn định hướng được.',
      },
    },
  },
  {
    slug: 'verdant',
    title: 'Verdant',
    category: 'ecommerce',
    year: '2025',
    color: '#1d5c3f',
    tone: 'light',
    url: 'https://example.com',
    images: placeholderShots('Verdant', '#1d5c3f', 3),
    copy: {
      en: {
        services: 'Development',
        overview: 'A plant shop storefront built around care guides, not just product grids.',
        challenge: 'Customers bought plants and lost them within a month, then never came back.',
        approach: 'Each product page doubles as a care schedule, with reminders that bring people back to the store.',
      },
      vi: {
        services: 'Phát triển',
        overview: 'Cửa hàng cây cảnh trực tuyến xoay quanh hướng dẫn chăm sóc, không chỉ là lưới sản phẩm.',
        challenge: 'Khách mua cây rồi làm chết cây trong vòng một tháng và không quay lại nữa.',
        approach: 'Mỗi trang sản phẩm kiêm luôn lịch chăm sóc, kèm nhắc nhở đưa khách quay lại cửa hàng.',
      },
    },
  },
  {
    slug: 'atlas-pay',
    title: 'Atlas Pay',
    category: 'saas',
    year: '2024',
    color: '#1e4fd8',
    tone: 'light',
    url: 'https://example.com',
    images: placeholderShots('Atlas Pay', '#1e4fd8', 4),
    copy: {
      en: {
        services: 'Design + Development',
        overview: 'Invoicing for small agencies, designed so a first invoice takes under a minute.',
        challenge: 'Competitors front-loaded setup; most sign-ups churned before sending anything.',
        approach: 'Progressive onboarding, smart defaults from the first client added and a live invoice preview.',
      },
      vi: {
        services: 'Thiết kế + Phát triển',
        overview: 'Phần mềm lập hóa đơn cho agency nhỏ, tạo hóa đơn đầu tiên chỉ trong chưa đầy một phút.',
        challenge: 'Đối thủ bắt người dùng thiết lập quá nhiều; phần lớn rời đi trước khi gửi hóa đơn nào.',
        approach: 'Làm quen từng bước, mặc định thông minh ngay từ khách hàng đầu tiên và xem trước hóa đơn trực tiếp.',
      },
    },
  },
  {
    slug: 'solace',
    title: 'Solace',
    category: 'wellness',
    year: '2024',
    color: '#e8b923',
    tone: 'dark',
    url: 'https://example.com',
    images: placeholderShots('Solace', '#e8b923', 3),
    copy: {
      en: {
        services: 'Design',
        overview: 'A breathing and sleep companion with a sunrise-inspired visual language.',
        challenge: 'Wellness apps felt either clinical or saccharine; the brief was warm but grown-up.',
        approach: 'A warm palette, slow easing curves and sessions that end with silence instead of streaks.',
      },
      vi: {
        services: 'Thiết kế',
        overview: 'Ứng dụng hỗ trợ hít thở và giấc ngủ với ngôn ngữ hình ảnh lấy cảm hứng từ bình minh.',
        challenge: 'Ứng dụng sức khỏe thường quá khô khan hoặc quá sến; yêu cầu là ấm áp nhưng trưởng thành.',
        approach: 'Bảng màu ấm, chuyển động chậm rãi và mỗi buổi tập kết thúc bằng sự tĩnh lặng thay vì chuỗi thành tích.',
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
export function projectPalette(project: Pick<Project, 'color' | 'tone'>): Record<string, string> {
  const fg = project.tone === 'light' ? '245 245 245' : '22 22 22';
  const inverseFg = project.tone === 'light' ? '#161616' : '#f5f5f5';
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

import 'server-only';
import type { Locale } from './i18n/config';
import { hiddenSlugs } from './hiddenSlugs';
import { localize, placeholderShots, projectSlugs, type ProjectSource } from './projects';
import { privateR2Image } from './r2Images.private';

/*
 * Personal projects, kept off every public list. They're listed only on /work/private; their detail
 * pages live at /work/private/<slug> and open from /work/<slug> too. All of it needs the access
 * cookie (see lib/privateAccess.ts). Add each slug to lib/hiddenSlugs.ts as well.
 *
 * Kept apart from lib/projects.ts on purpose: that module is also bundled for the browser (the page
 * transition reads project titles), and 'server-only' makes sure none of this ships to visitors.
 * Slugs must not clash with lib/projects.ts, nor be "archive" or "private".
 *
 * Image sources go in assets/images/private/projects/<slug>/ (then `npm run images:upload`).
 */

const foodHero = privateR2Image("projects/food-lucky-wheel/hero");
const food01 = privateR2Image("projects/food-lucky-wheel/01");
const food02 = privateR2Image("projects/food-lucky-wheel/02");
const food03 = privateR2Image("projects/food-lucky-wheel/03");
const food04 = privateR2Image("projects/food-lucky-wheel/04");
const food05 = privateR2Image("projects/food-lucky-wheel/05");

const filmHero = privateR2Image("projects/film-files/hero");
const film01 = privateR2Image("projects/film-files/01");
const film02 = privateR2Image("projects/film-files/02");
const film03 = privateR2Image("projects/film-files/03");
const film04 = privateR2Image("projects/film-files/04");
const film05 = privateR2Image("projects/film-files/05");
const film06 = privateR2Image("projects/film-files/06");


/** Copy for the /work/private page itself (not in the dictionaries, which are bundled for the browser). */
export const privatePageCopy: Record<Locale, { title: string; metaTitle: string }> = {
  en: { title: 'Personal projects, just for me', metaTitle: 'Private' },
  vi: { title: 'Dự án cá nhân, chỉ dành cho tôi', metaTitle: 'Riêng tư' },
};

const sources: ProjectSource[] = [
  {
    slug: "food-lucky-wheel",
    title: "Food Lucky Wheel",
    titleParts: ["Food", "Lucky Wheel"],
    categories: ["other"],
    year: "2026",
    url: "https://food-lucky-wheel.vercel.app/vi",
    githubWeb: "https://github.com/TruongCongTri/food-lucky-wheel.git",
    githubAPI: undefined,
    // Street-food palette: warm paper and ink, with chili, maroon and turmeric accents.
    color: "#f3ede3",
    tone: "dark",
    textColor: "#1a1414",
    sectionColors: [
      { color: "#f3ede3", tone: "dark", textColor: "#1a1414" },
      { color: "#e4411f", tone: "light", textColor: "#fbf8f2" },
      { color: "#6e1f2a", tone: "light", textColor: "#f2c14e" },
      { color: "#f2c14e", tone: "dark", textColor: "#1a1414" },
    ],
    hero: foodHero,
    images: [
      food01,
      food02,
      food03,
      food04,
      food05,
    ],
    copy: {
      en: {
        services: "Frontend Development + Motion",
        overview:
          "A playful spin-the-wheel app that settles the daily “what should we eat?” question with a single flick.",
        challenge: [
          "Deciding where or what to eat is a small daily friction that quietly eats time, especially in a group where nobody wants to be the one who picks.",
          "The wheel had to feel physical and fair: a spin with real momentum, an outcome nobody can predict, and a list of dishes that is quick to edit as cravings change.",
        ],
        approach: [
          "I built an editable menu of dishes that feeds a canvas wheel, with an eased, momentum-based spin that slows naturally before landing on the winner.",
          "A warm street-food palette of paper, ink, chili and turmeric keeps it cheerful, and recent results are remembered so the same dish doesn't come up night after night.",
        ],
      },
      vi: {
        services: "Phát triển Frontend + Chuyển động",
        overview:
          "Ứng dụng vòng quay may mắn vui nhộn, giải quyết câu hỏi “hôm nay ăn gì?” chỉ với một cú quay.",
        challenge: [
          "Chọn món hay chọn quán là một phiền toái nhỏ mỗi ngày nhưng lại tốn thời gian, nhất là khi đi nhóm và chẳng ai muốn là người quyết định.",
          "Vòng quay cần có cảm giác chân thật và công bằng: quay có quán tính, kết quả không thể đoán trước, và danh sách món ăn dễ dàng chỉnh sửa theo khẩu vị từng ngày.",
        ],
        approach: [
          "Tôi xây dựng danh sách món ăn có thể chỉnh sửa, hiển thị trên vòng quay canvas với chuyển động có quán tính, giảm tốc tự nhiên trước khi dừng ở món được chọn.",
          "Bảng màu ấm áp lấy cảm hứng từ ẩm thực đường phố—giấy, mực, ớt và nghệ—tạo cảm giác vui tươi, đồng thời ghi nhớ các kết quả gần đây để một món không lặp lại liên tục.",
        ],
      },
    },
  },
  {
    slug: "personal-movie-blog",
    title: "Personal Movie Blog",
    titleParts: ["Personal", "Movie Blog"],
    categories: ["other"],
    year: "2026",
    url: "https://personal-blog-seven-gamma.vercel.app/en",
    githubWeb: "https://github.com/TruongCongTri/personal-blog.git",
    githubAPI: undefined,
    // Editorial palette: warm paper and near-black ink, with a highlighter-yellow accent.
    color: "#fdfaf7",
    tone: "dark",
    textColor: "#191919",
    sectionColors: [
      { color: "#fdfaf7", tone: "dark", textColor: "#191919" },
      { color: "#191919", tone: "light", textColor: "#ffe927" },
      { color: "#ffe927", tone: "dark", textColor: "#191919" },
      { color: "#191919", tone: "light", textColor: "#fdfaf7" },
    ],
    
    hero: filmHero,
    images: [
      film01,
      film02,
      film03,
      film04,
      film05,
      film06,
    ],
    copy: {
      en: {
        services: "Frontend Development + Editorial Design",
        overview:
          "A personal blog of long-form film analysis, breaking down the story, craft and ideas behind the movies I watch.",
        challenge: [
          "Film analysis is long, layered writing. Most blog templates treat it like a news feed, burying the argument under sidebars, ads and cramped type.",
          "I wanted a quiet reading space that respects long essays while still making it easy to browse by film, director or theme and revisit earlier pieces.",
        ],
        approach: [
          "I designed an editorial layout around generous, highly readable typography on warm paper, using a single highlighter-yellow accent to mark key quotes, scores and takeaways.",
          "Posts are organized by film, director and theme, with spoiler-safe sections and pull quotes, so each analysis reads like a magazine essay rather than a feed item.",
        ],
      },
      vi: {
        services: "Phát triển Frontend + Thiết kế biên tập",
        overview:
          "Blog cá nhân với những bài phân tích phim chuyên sâu, mổ xẻ câu chuyện, kỹ thuật làm phim và ý tưởng đằng sau những bộ phim tôi đã xem.",
        challenge: [
          "Phân tích phim là thể loại viết dài và nhiều tầng ý nghĩa, nhưng phần lớn giao diện blog lại trình bày như một bảng tin, khiến lập luận bị chìm giữa thanh bên, quảng cáo và chữ chật chội.",
          "Tôi muốn một không gian đọc tĩnh lặng, tôn trọng những bài viết dài, đồng thời dễ dàng duyệt theo phim, đạo diễn hay chủ đề và xem lại các bài cũ.",
        ],
        approach: [
          "Tôi thiết kế bố cục theo phong cách tạp chí với kiểu chữ rộng rãi, dễ đọc trên nền giấy ấm, dùng duy nhất một màu vàng dạ quang để làm nổi bật trích dẫn, điểm số và ý chính.",
          "Bài viết được sắp xếp theo phim, đạo diễn và chủ đề, có các phần cảnh báo spoiler và trích dẫn nổi bật, để mỗi bài phân tích đọc như một bài luận tạp chí thay vì một mục tin.",
        ],
      },
    },
  },
];

// Fail the build, rather than silently 404, if the slug lists drift apart or clash with public work.
const slugs = sources.map((p) => p.slug);
if (slugs.length !== hiddenSlugs.length || slugs.some((slug) => !hiddenSlugs.includes(slug))) {
  throw new Error('lib/hiddenSlugs.ts must list exactly the slugs in lib/hiddenProjects.ts');
}
if (slugs.some((slug) => projectSlugs.includes(slug) || slug === 'archive' || slug === 'private')) {
  throw new Error('A hidden project slug clashes with a public project or a reserved /work route');
}

export const hiddenProjectSlugs = slugs;

export function getHiddenProjects(locale: Locale) {
  return sources.map((p) => localize(p, locale));
}

export function getHiddenProject(slug: string, locale: Locale) {
  const source = sources.find((p) => p.slug === slug);
  return source && localize(source, locale);
}

/** Previous/next among the hidden projects only, so the hand-off never leads back to public work. */
export function getAdjacentHiddenProjects(slug: string, locale: Locale) {
  const index = sources.findIndex((p) => p.slug === slug);
  const count = sources.length;
  if (index === -1 || count < 2) return null;
  return {
    prev: localize(sources[(index - 1 + count) % count], locale),
    next: localize(sources[(index + 1) % count], locale),
  };
}

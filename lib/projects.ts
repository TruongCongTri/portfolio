import type { StaticImageData } from "next/image";
import type { Locale } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries";

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
import chinhNamHero from "../public/projects/chinh-nam-portfolio/hero.png";
import chinhNam01 from "../public/projects/chinh-nam-portfolio/01.png";
import chinhNam02 from "../public/projects/chinh-nam-portfolio/02.png";
import chinhNam03 from "../public/projects/chinh-nam-portfolio/03.png";
import chinhNam04 from "../public/projects/chinh-nam-portfolio/04.png";
import chinhNam05 from "../public/projects/chinh-nam-portfolio/05.png";
import chinhNamErpHero from "../public/projects/chinh-nam-erp/hero.png";
import chinhNamErp01 from "../public/projects/chinh-nam-erp/01.png";
import chinhNamErp02 from "../public/projects/chinh-nam-erp/02.png";
import chinhNamErp03 from "../public/projects/chinh-nam-erp/03.png";
import chinhNamErp04 from "../public/projects/chinh-nam-erp/04.png";
import chinhNamErp05 from "../public/projects/chinh-nam-erp/05.png";
import chinhNamErp06 from "../public/projects/chinh-nam-erp/06.png";
import chinhNamErp07 from "../public/projects/chinh-nam-erp/07.png";
import chinhNamErp08 from "../public/projects/chinh-nam-erp/08.png";
import chinhNamErp10 from "../public/projects/chinh-nam-erp/10.png";
import vietDynamicHero from "../public/projects/viet-dynamic-elearning/hero.png";
import vietDynamic01 from "../public/projects/viet-dynamic-elearning/01.png";
import vietDynamic02 from "../public/projects/viet-dynamic-elearning/02.png";
import vietDynamic03 from "../public/projects/viet-dynamic-elearning/03.png";
import vietDynamic04 from "../public/projects/viet-dynamic-elearning/04.png";
import vietDynamic05 from "../public/projects/viet-dynamic-elearning/05.png";
import vietDynamic06 from "../public/projects/viet-dynamic-elearning/06.png";
import thanhHoangHero from "../public/projects/thanh-hoang/hero.png";
import thanhHoang01 from "../public/projects/thanh-hoang/01.png";
import thanhHoang10 from "../public/projects/thanh-hoang/10.png";
import thanhHoang02 from "../public/projects/thanh-hoang/02.png";
import thanhHoang03 from "../public/projects/thanh-hoang/03.png";
import thanhHoang04 from "../public/projects/thanh-hoang/04.png";
import thanhHoang05 from "../public/projects/thanh-hoang/05.png";
import thanhHoang06 from "../public/projects/thanh-hoang/06.png";
import thanhHoang07 from "../public/projects/thanh-hoang/07.png";
import thanhHoang08 from "../public/projects/thanh-hoang/08.png";
import thanhHoang09 from "../public/projects/thanh-hoang/09.png";

/** A statically imported screenshot, or a remote URL (the placeholders). */
export type ProjectImage = StaticImageData | string;

/** URL of a project image (for metadata, JSON-LD, keys). */
export const imageUrl = (image: ProjectImage) =>
  typeof image === "string" ? image : image.src;

/** Blurred preview while loading — only local imports have one. */
export const blurPlaceholder = (image: ProjectImage) =>
  typeof image === "string" ? "empty" : "blur";

export type CategoryId = keyof Dictionary["work"]["categories"];

type LocalizedCopy = {
  services: string;
  /** One sentence: shown as the "{Project} — {overview}" headline. */
  overview: string;
  /** Paragraphs under "Challenge". */
  challenge: string[];
  /** Paragraphs under "Approach". */
  approach: string[];
  disclaimer?: string;
};

type ProjectSource = {
  slug: string;
  title: string;
  /**
   * The title split into [name, site type], e.g. ['Chinh Nam', 'ERP']. When the hero title is too
   * long for one line it breaks between the two parts, never inside either. Omit to keep it whole.
   */
  titleParts?: [string, string];
  /** One or more; the work page filter lists the project under each. */
  categories: CategoryId[];
  year: string;
  /** Brand color: the detail page's background, card backgrounds and hand-off gradient. */
  color: string;
  /** Whether text on `color` should be light or dark (ignored when `textColor` is set). */
  tone: "light" | "dark";
  /** Explicit brand text color (hex), for projects with a signature text color. */
  textColor?: string;
  /**
   * Color combinations shuffled across the detail page's sections (hero, overview, gallery) on each
   * visit, instead of painting it all in `color`. Include `color` itself: a seamless hand-off keeps
   * the hero in it, since the next-project preview has already shown it there.
   */
  sectionColors?: SectionColors[];
  /** Live site, opened from the cover image and the "View live" button. */
  url?: string;
  /** GitHub repository for the frontend / client application. */
  githubWeb?: string;
  /** GitHub repository for the backend API / service. */
  githubAPI?: string;
  /** Older work: listed on /work/archive instead of /work and the home page; its detail page stays. */
  isArchive?: boolean;
  /** Detail page hero image (public/projects/<slug>/hero.png); falls back to the cover. */
  hero?: ProjectImage;
  /** Display order; the first is the cover. */
  images: ProjectImage[];
  copy: Record<Locale, LocalizedCopy>;
};

export type SectionColors = Pick<ProjectSource, "color" | "tone" | "textColor">;

/** A project with its copy resolved for one locale. */
export type Project = Omit<ProjectSource, "copy"> & LocalizedCopy;

/** Placeholder screens tinted with the project colors — swap for real screenshots. */
function placeholderShots(
  title: string,
  color: string,
  count: number,
  textColor = "#ffffff",
) {
  const label = encodeURIComponent(title).replace(/%20/g, "+");
  return Array.from(
    { length: count },
    (_, i) =>
      `https://placehold.co/1600x1000/${color.slice(1)}/${textColor.slice(1)}/png?text=${label}+${i + 1}&font=montserrat`,
  );
}

// TODO: confirm each project's year and add `url` once the live sites are public.
const sources: ProjectSource[] = [
  {
    slug: "thanh-hoang-booking-demo",
    title: "Thành Hoàng Booking Demo",
    titleParts: ["Thành Hoàng", "Booking Demo"],
    categories: ["eCommerce"],
    year: "2026",
    url: "https://thanhhoang-ticket-booking-demo.vercel.app/",
    githubWeb: "https://github.com/TruongCongTri/thanhhoang-ticket-booking-demo",
    githubAPI: "https://github.com/TruongCongTri/thanhhoang-ticket-booking-api",
    color: "#0a6cc2",
    tone: "light",
    textColor: "#f5a830",
    hero: thanhHoangHero,
    images: [
      thanhHoang10,
      thanhHoang01,
      thanhHoang02,
      thanhHoang03,
      thanhHoang04,
      thanhHoang05,
      thanhHoang06,
      thanhHoang07,
      thanhHoang08,
      thanhHoang09,
    ],
    copy: {
      en: {
        services: "Full-stack Development + 3D & Motion",
        overview:
          "A comprehensive demo flight booking platform handling both domestic and international routes, showcasing end-to-end user flows from interactive 3D discovery to final ticketing.",
        challenge: [
          "Building a seamless flight booking experience requires managing highly complex simulated data across multiple carriers—including domestic partners like Vietnam Airlines, Bamboo Airways, Vietjet Air, and Vietravel Airlines, alongside international routes via China Airlines, EVA Air, Sichuan Airlines, Qatar Airways, Air India, and Japan Airlines.",
          "The primary challenge was balancing these intricate booking, payment, and ticketing logic flows with engaging, high-performance 3D interactions without overwhelming the user.",
        ],
        approach: [
          "I engineered an end-to-end simulated booking architecture built on a modern motion stack. Interactive 3D elements powered by Three.js elevate the standard grid-based booking interface, while GSAP and Lenis are synchronized to deliver buttery-smooth, scroll-driven animations across the entire flow.",
          "Under the hood, robust state management tightly handles the simulated payment and ticket generation processes, demonstrating a production-ready approach that successfully balances complex e-commerce data handling with high-performance creative development.",
        ],
        disclaimer:
          "This is a portfolio demo built to showcase my end-to-end development skills. It is not affiliated with or endorsed by Thành Hoàng, and no real bookings, payments, or data transfers are made. If you represent the company and request removal or changes, please get in touch for prompt action.",
      },
      vi: {
        services: "Phát triển Full-stack + 3D & Chuyển động",
        overview:
          "Nền tảng demo đặt vé máy bay toàn diện cho các chuyến bay nội địa và quốc tế, thể hiện quy trình người dùng xuyên suốt từ tương tác 3D khám phá đến xuất vé cuối cùng.",
        challenge: [
          "Việc xây dựng trải nghiệm đặt vé mượt mà đòi hỏi phải xử lý dữ liệu mô phỏng phức tạp từ nhiều hãng hàng không—bao gồm các đối tác nội địa như Vietnam Airlines, Bamboo Airways, Vietjet Air, Vietravel Airlines, cùng mạng bay quốc tế qua China Airlines, EVA Air, Sichuan Airlines, Qatar Airways, Air India và Japan Airlines.",
          "Thử thách cốt lõi là cân bằng giữa logic đặt vé, thanh toán và xuất vé phức tạp với các tương tác 3D sinh động, hiệu suất cao mà không làm người dùng bị ngợp.",
        ],
        approach: [
          "Tôi đã xây dựng một kiến trúc đặt vé mô phỏng toàn trình dựa trên stack chuyển động hiện đại. Các yếu tố 3D tương tác sử dụng Three.js nâng tầm giao diện đặt vé tiêu chuẩn, trong khi GSAP và Lenis được kết hợp chặt chẽ để mang lại hiệu ứng chuyển động theo thao tác cuộn cực kỳ mượt mà xuyên suốt toàn bộ quy trình.",
          "Bên dưới giao diện, hệ thống quản lý trạng thái xử lý trơn tru quá trình mô phỏng thanh toán và tạo vé, thể hiện tư duy kiến trúc sẵn sàng cho môi trường thực tế, cân bằng hoàn hảo giữa logic thương mại điện tử phức tạp và hiệu suất lập trình sáng tạo (creative development).",
        ],
        disclaimer:
          "Đây là dự án demo nhằm thể hiện kỹ năng lập trình toàn trình, không trực thuộc hay được bảo trợ bởi Thành Hoàng. Không có giao dịch, thanh toán hay truyền dữ liệu thật nào được thực hiện. Nếu bạn là đại diện của công ty và có yêu cầu chỉnh sửa hoặc gỡ bỏ, vui lòng liên hệ để được hỗ trợ ngay lập tức.",
      },
    },
  },
  {
    slug: "pizza-piatto",
    title: "Pizza Piatto",
    titleParts: ["Pizza", "Piatto"],
    categories: ["portfolio"],
    year: "2026",
    url: undefined,
    githubWeb: undefined,
    githubAPI: undefined,
    // Navy and gold from the Pizza Piatto logo.
    color: "#151d32",
    tone: "light",
    textColor: "#f2b950",
    images: placeholderShots("Pizza Piatto", "#151d32", 4, "#f2b950"),
    copy: {
      en: {
        services: "Design + Development",
        overview:
          "A restaurant site for Pizza Piatto that shows off its kitchen, ingredients and menu, and takes table reservations online.",
        challenge: [
          "Pizza Piatto’s appeal is in the details — the dough, the toppings, the ingredients it sources — but a menu list alone doesn’t make anyone hungry.",
          "Guests also had to phone to book a table, so the site needed to turn interest into a reservation without sending them anywhere else.",
        ],
        approach: [
          "The site leads with the food: ingredient stories and a browsable menu, set in the navy and gold of the Pizza Piatto logo, with motion that brings each dish forward as you scroll.",
          "A reservation flow sits one click from every page: guests pick a date, time and party size, and the restaurant receives each booking straight away.",
        ],
      },
      vi: {
        services: "Thiết kế + Phát triển",
        overview:
          "Website nhà hàng cho Pizza Piatto, giới thiệu căn bếp, nguyên liệu và thực đơn, đồng thời cho phép đặt bàn trực tuyến.",
        challenge: [
          "Sức hút của Pizza Piatto nằm ở từng chi tiết — đế bánh, nhân bánh, nguồn nguyên liệu — nhưng chỉ một danh sách món ăn thì không khiến ai thấy thèm.",
          "Khách còn phải gọi điện để đặt bàn, nên website cần biến sự quan tâm thành một lượt đặt bàn mà không phải chuyển sang nơi khác.",
        ],
        approach: [
          "Website đặt món ăn lên trước: câu chuyện nguyên liệu và thực đơn dễ duyệt, trong tông xanh navy và vàng của logo Pizza Piatto, cùng chuyển động đưa từng món ăn nổi bật khi cuộn trang.",
          "Luồng đặt bàn luôn cách mọi trang một cú nhấp: khách chọn ngày, giờ và số người, và nhà hàng nhận được từng lượt đặt ngay lập tức.",
        ],
      },
    },
  },
  {
    slug: "studio-portfolio",
    title: "Studio Portfolio",
    titleParts: ["Studio", "Portfolio"],
    categories: ["portfolio"],
    year: "2026",
    url: undefined,
    githubWeb: undefined,
    githubAPI: undefined,
    // The site's page-transition palette: green, orange and pink blocks take near-black type,
    // blue takes cream. Green stands in wherever a single color is needed (cards, hand-off).
    color: "#5ea85e",
    tone: "dark",
    textColor: "#0f0f0f",
    sectionColors: [
      { color: "#5ea85e", tone: "dark", textColor: "#0f0f0f" },
      { color: "#ff8356", tone: "dark", textColor: "#0f0f0f" },
      { color: "#ffbab4", tone: "dark", textColor: "#0f0f0f" },
      { color: "#216ad1", tone: "light", textColor: "#ffffeb" },
    ],
    images: placeholderShots("Studio Portfolio", "#5ea85e", 4, "#0f0f0f"),
    copy: {
      en: {
        services: "Design + Development",
        overview:
          "A portfolio for a creative studio that puts its whole body of work on show and lets clients commission a project.",
        challenge: [
          "The studio’s range was its selling point, but a long archive of projects made it hard for visitors to see that range at a glance.",
          "Commissions arrived through scattered emails and messages, usually missing the details the studio needed to quote.",
        ],
        approach: [
          "The site shows the whole archive through filters and bold, playful motion in a green, orange, pink and blue palette that is as loud as the studio’s work.",
          "A commission flow guides clients through the project type, scope, timeline and budget, so every brief reaches the studio complete and ready to quote.",
        ],
      },
      vi: {
        services: "Thiết kế + Phát triển",
        overview:
          "Website portfolio cho một studio sáng tạo, trưng bày toàn bộ tác phẩm và cho phép khách hàng đặt hàng dự án.",
        challenge: [
          "Sự đa dạng là thế mạnh của studio, nhưng một kho dự án dài khiến người xem khó thấy được sự đa dạng ấy chỉ trong một cái nhìn.",
          "Yêu cầu đặt hàng đến qua email và tin nhắn rời rạc, thường thiếu những thông tin studio cần để báo giá.",
        ],
        approach: [
          "Website trưng bày toàn bộ kho tác phẩm qua bộ lọc cùng chuyển động táo bạo, vui nhộn trong bảng màu xanh lá, cam, hồng và xanh dương, nổi bật như chính tác phẩm của studio.",
          "Luồng đặt hàng hướng dẫn khách chọn loại dự án, phạm vi, thời gian và ngân sách, để mỗi yêu cầu đến tay studio đầy đủ và sẵn sàng báo giá.",
        ],
      },
    },
  },
  {
    slug: "chinh-nam-portfolio",
    title: "Chinh Nam Portfolio",
    titleParts: ["Chinh Nam", "Portfolio"],
    categories: ["portfolio"],
    year: "2026",
    url: "https://chinhnam-web.onrender.com/",
    githubWeb: "https://github.com/TruongCongTri/erp-portfolio",
    githubAPI: undefined,
    color: "#0e58cf",
    tone: "light",
    hero: chinhNamHero,
    images: [chinhNam01, chinhNam02, chinhNam03, chinhNam04, chinhNam05],
    copy: {
      en: {
        services: "Design + Development",
        overview:
          "A company site for Chinh Nam that tells the story of its ethics, culture and work through scroll-driven motion.",
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
        services: "Thiết kế + Phát triển",
        overview:
          "Website doanh nghiệp cho Chinh Nam, kể câu chuyện về đạo đức, văn hóa và dự án của công ty qua chuyển động theo cuộn trang.",
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
    slug: "chinh-nam-erp",
    title: "Chinh Nam ERP",
    titleParts: ["Chinh Nam", "ERP"],
    categories: ["enterprise"],
    year: "2026",
    url: undefined,
    githubWeb: "https://github.com/TruongCongTri/erp-web",
    githubAPI: "https://github.com/TruongCongTri/erp-api",
    // No brand color given — a neutral slate to set the internal tool apart from the public site.
    color: "#2b313c",
    tone: "light",
    hero: chinhNamErpHero,
    images: [
      chinhNamErp01,
      chinhNamErp02,
      chinhNamErp03,
      chinhNamErp04,
      chinhNamErp05,
      chinhNamErp06,
      chinhNamErp07,
      chinhNamErp08,
      chinhNamErp10,
    ],
    copy: {
      en: {
        services: "Full-stack Development",
        overview:
          "An internal ERP that runs Chinh Nam’s day-to-day operations on an enterprise resource planning model.",
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
        services: "Phát triển Full-stack",
        overview:
          "Hệ thống ERP nội bộ vận hành công việc hằng ngày của Chinh Nam theo mô hình quản trị nguồn lực doanh nghiệp.",
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
    slug: "vietdynamic-elearning",
    title: "VietDynamic E-learning",
    titleParts: ["VietDynamic", "E-learning"],
    categories: ["eCommerce", "eLearning"],
    year: "2025",
    url: undefined,
    githubWeb: undefined,
    githubAPI: undefined,
    color: "#ba0027",
    tone: "light",
    hero: vietDynamicHero,
    images: [
      vietDynamic01,
      vietDynamic02,
      vietDynamic03,
      vietDynamic04,
      vietDynamic05,
      vietDynamic06,
    ],

    copy: {
      en: {
        services: "Full-stack Development",
        overview:
          "An e-learning platform with video streaming, a course store and online payments.",
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
        services: "Phát triển Full-stack",
        overview:
          "Nền tảng học trực tuyến với phát video trực tuyến, cửa hàng khóa học và thanh toán online.",
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
    slug: "skincare-ecommerce",
    title: "Skincare E-commerce",
    titleParts: ["Skincare", "E-commerce"],
    categories: ["eCommerce"],
    isArchive: true,
    year: "2026",
    url: undefined,
    githubWeb: undefined,
    githubAPI: undefined,
    // Brand palette: deep espresso page, antique-gold text, cream for the product shots.
    color: "#1f1c17",
    tone: "light",
    textColor: "#c5a25d",
    images: placeholderShots("Skincare", "#fefbf4", 4, "#1f1c17"),
    copy: {
      en: {
        services: "Design + Development",
        overview:
          "An online skincare store where modern GSAP motion gives every product the unhurried feel of a boutique counter.",
        challenge: [
          "Skincare is bought on trust and texture, and a flat grid of product photos can’t convey either.",
          "The store had to feel as considered as the products — calm, premium and tactile — while staying quick to browse, compare and check out.",
        ],
        approach: [
          "Modern GSAP carries the experience: ScrollTrigger-driven reveals, product images that ease into place and smooth transitions between collections, all tuned to feel slow and deliberate rather than busy.",
          "The espresso, antique-gold and cream palette frames each product like a boutique shelf, and the motion always steps aside for the essentials — clear prices, ingredients and a short path to checkout.",
        ],
      },
      vi: {
        services: "Thiết kế + Phát triển",
        overview:
          "Cửa hàng mỹ phẩm chăm sóc da trực tuyến, nơi chuyển động GSAP hiện đại mang lại cảm giác thong thả như tại quầy boutique cho từng sản phẩm.",
        challenge: [
          "Mỹ phẩm chăm sóc da được mua bằng sự tin tưởng và cảm nhận về kết cấu, điều mà một lưới ảnh sản phẩm phẳng không thể truyền tải.",
          "Cửa hàng phải mang cảm giác chỉn chu như chính sản phẩm — tĩnh lặng, cao cấp và giàu xúc cảm — mà vẫn nhanh khi duyệt, so sánh và thanh toán.",
        ],
        approach: [
          "GSAP hiện đại dẫn dắt trải nghiệm: nội dung hiện dần theo ScrollTrigger, ảnh sản phẩm nhẹ nhàng vào vị trí và chuyển cảnh mượt giữa các bộ sưu tập, tất cả được tinh chỉnh để chậm rãi và có chủ đích thay vì rối mắt.",
          "Bảng màu nâu espresso, vàng cổ điển và kem đặt mỗi sản phẩm như trên kệ boutique, còn chuyển động luôn nhường chỗ cho điều cốt yếu — giá rõ ràng, thành phần và đường đi ngắn đến thanh toán.",
        ],
      },
    },
  },
  {
    slug: "airport-digital-twin",
    title: "Airport Digital Twin",
    titleParts: ["Airport", "Digital Twin"],
    categories: ["digitalTwin"],
    year: "2025",
    url: undefined,
    githubWeb: "https://github.com/TruongCongTri/Digital-Twin-Airport-web",
    githubAPI: "https://github.com/TruongCongTri/Digital-Twin-Airport-api",
    // No brand color given — a deep aviation teal.
    color: "#0d5c63",
    tone: "light",
    images: placeholderShots("Airport Digital Twin", "#0d5c63", 4),
    copy: {
      en: {
        services: "Full-stack Development",
        overview:
          "A digital twin platform that models airports and tracks live ground aircraft and sensors, both indoors and outdoors.",
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
        services: "Phát triển Full-stack",
        overview:
          "Nền tảng bản sao số mô hình hóa sân bay, theo dõi trực tiếp máy bay dưới mặt đất và cảm biến trong nhà lẫn ngoài trời.",
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
    slug: "digital-twin",
    title: "Digital Twin",
    categories: ["digitalTwin"],
    year: "2025",
    url: undefined,
    githubWeb: "https://github.com/TruongCongTri/Digital-Twin-web",
    githubAPI: "https://github.com/TruongCongTri/Digital-Twin-api",
    color: "#002244",
    tone: "light",
    textColor: "#b3995d",
    images: placeholderShots("Digital Twin", "#002244", 4, "#b3995d"),
    copy: {
      en: {
        services: "Full-stack Development",
        overview:
          "A 3D digital twin platform for the Vietnam Aerospace University, where students upload building models to explore.",
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
        services: "Phát triển Full-stack",
        overview:
          "Nền tảng bản sao số 3D cho Trường Đại học Hàng không Vũ trụ Việt Nam, nơi sinh viên tải lên mô hình công trình để khám phá.",
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
  {
    slug: "build-sense",
    title: "BuildSense",
    titleParts: ["Build", "Sense"],
    categories: ["digitalTwin"],
    isArchive: true,
    year: "2025",
    url: undefined,
    githubWeb: "https://github.com/TruongCongTri/BuildSense",
    githubAPI: undefined,
    // Civil engineering infrastructure palette: deep steel-slate with telemetry amber text
    color: "#182632",
    tone: "light",
    textColor: "#f2a93b",
    images: placeholderShots("BuildSense", "#182632", 4, "#f2a93b"),
    copy: {
      en: {
        services: "GIS & Digital Twin Development",
        overview:
          "A smart infrastructure digital twin platform powered by ArcGIS to monitor structural health and real-time sensor metrics across roads, bridges, and civil assets.",
        challenge: [
          "Public infrastructure assets like bridges, roadways, and transit structures operate under continuous mechanical strain and weather exposure, but inspection logs and sensor data traditionally sit trapped in siloed databases.",
          "Civil engineers and municipal operators needed an intuitive, spatially grounded interface to observe diverse IoT sensor feeds—including strain gauges, vibration, deflection, and thermal changes—projected directly onto 3D structures.",
        ],
        approach: [
          "We engineered an infrastructure twin platform combining ArcGIS geospatial mapping with a responsive Next.js and Redux front end, placing sensor telemetries in context across realistic civil structures.",
          "Real-time event streams ingest continuous field telemetry, trigger automated threshold alerts, and visualize stress points directly on road and bridge geometries to support predictive maintenance before structural faults occur.",
        ],
      },
      vi: {
        services: "Phát triển GIS & Bản sao số",
        overview:
          "Nền tảng bản sao số hạ tầng thông minh ứng dụng ArcGIS, giám sát sức khỏe kết cấu và dữ liệu cảm biến thời gian thực cho cầu đường và công trình giao thông.",
        challenge: [
          "Các công trình hạ tầng giao thông như cầu, đường bộ và kết cấu công cộng chịu tải trọng lớn và biến đổi môi trường liên tục, nhưng số liệu cảm biến hiện trường thường bị lưu trữ phân mảnh và thiếu tính trực quan.",
          "Kỹ sư xây dựng và cơ quan vận hành cần một giao diện gắn liền với không gian thực tế để theo dõi đồng thời các dữ liệu IoT—như độ biến dạng, độ rung, độ võng và nhiệt độ—trực tiếp trên từng bộ phận hình học 3D của công trình.",
        ],
        approach: [
          "Chúng tôi xây dựng giải pháp bản sao số kết hợp bản đồ ArcGIS với frontend Next.js và Redux, đưa toàn bộ dữ liệu viễn thám vào đúng tọa độ và ngữ cảnh không gian của từng cây cầu và tuyến đường.",
          "Hệ thống tiếp nhận luồng dữ liệu thời gian thực để trực quan hóa các điểm ứng suất, tự động kích hoạt cảnh báo vượt ngưỡng an toàn và hỗ trợ bảo trì dự đoán trước khi xuất hiện hư hại kết cấu nghiêm trọng.",
        ],
      },
    },
  },
  {
    slug: "interview-prep-coach",
    title: "Interview Prep Coach",
    titleParts: ["Interview", "Prep Coach"],
    categories: ["ai"],
    isArchive: true,
    year: "2025",
    url: "https://interview-prep-coach-khaki.vercel.app",
    githubWeb: "https://github.com/TruongCongTri/InterviewPrepCoach",
    githubAPI: undefined,
    // Warm editorial studio palette: refined warm-stone background with espresso-carbon text
    color: "#f6f4ee",
    tone: "dark",
    textColor: "#2b2620",
    images: placeholderShots("Interview Prep Coach", "#f6f4ee", 4, "#2b2620"),
    copy: {
      en: {
        services: "Full-stack Development + Generative AI",
        overview:
          "An AI-powered interview practice platform that simulates personalized technical and behavioral mock sessions customized by role, seniority, duration, and targeted skill sets.",
        challenge: [
          "Job seekers frequently struggle with generic interview question banks that fail to mirror the nuanced expectations of specialized positions, differing seniority levels, or real-world time pressure.",
          "To provide tangible practice value, the coach needed to dynamically adapt to candidate answers, track pacing, and deliver structured, criteria-driven feedback rather than generic conversational remarks.",
        ],
        approach: [
          "We engineered an adaptive prompt orchestration engine that configures interview sessions based on the exact job domain, position seniority (from entry-level to lead), duration, and specific technology stacks.",
          "Real-time LLM streaming simulates a realistic interviewer presence, scoring each answer against industry competency rubrics and delivering actionable feedback summaries with personalized improvement tips at the end of every round.",
        ],
      },
      vi: {
        services: "Phát triển Full-stack + Generative AI",
        overview:
          "Nền tảng luyện phỏng vấn tích hợp AI, mô phỏng các buổi phỏng vấn chuyên sâu theo vai trò công việc, cấp bậc chuyên môn, thời lượng và bộ kỹ năng mục tiêu.",
        challenge: [
          "Ứng viên tìm việc thường gặp trở ngại khi sử dụng các ngân hàng câu hỏi mẫu chung chung, vốn không phản ánh đúng yêu cầu thực tế của từng vị trí, cấp độ kinh nghiệm hay áp lực thời gian trong phòng phỏng vấn.",
          "Để mang lại hiệu quả rèn luyện thực tế, hệ thống cần linh hoạt điều chỉnh câu hỏi theo câu trả lời của ứng viên, kiểm soát thời lượng và cung cấp đánh giá có cấu trúc thay vì phản hồi máy móc.",
        ],
        approach: [
          "Chúng tôi thiết kế kiến trúc điều phối prompt linh hoạt, cho phép thiết lập buổi phỏng vấn chuẩn xác theo lĩnh vực công việc, cấp bậc (từ mới bắt đầu đến trưởng nhóm), thời gian làm bài và từng bộ kỹ năng chuyên biệt.",
          "Luồng phản hồi AI thời gian thực (LLM streaming) tạo trải nghiệm tương tác tự nhiên, chấm điểm câu trả lời theo các tiêu chuẩn năng lực và xuất báo cáo phân tích chi tiết kèm gợi ý cải thiện sau mỗi phiên phỏng vấn.",
        ],
      },
    },
  },
];

function localize(
  { copy, ...project }: ProjectSource,
  locale: Locale,
): Project {
  return { ...project, ...copy[locale] };
}

export const projectSlugs = sources.map((p) => p.slug);

export const categoryIds = [...new Set(sources.flatMap((p) => p.categories))];

/** A project's category names, e.g. "E-commerce, E-learning". */
export function categoryLabel(
  project: Pick<Project, "categories">,
  labels: Record<CategoryId, string>,
) {
  return project.categories.map((id) => labels[id]).join(", ");
}

const current = sources.filter((p) => !p.isArchive);
const archived = sources.filter((p) => p.isArchive);

/** Current work (/work, home page); archived projects are left out. */
export function getProjects(locale: Locale) {
  return current.map((p) => localize(p, locale));
}

/** Archived work (/work/archive). */
export function getArchivedProjects(locale: Locale) {
  return archived.map((p) => localize(p, locale));
}

/** The `count` most recent current projects (by year; list order breaks ties, so newest-first within a year). */
export function getLatestProjects(locale: Locale, count: number) {
  return current
    .map((source, index) => ({ source, index }))
    .sort(
      (a, b) =>
        Number(b.source.year) - Number(a.source.year) || a.index - b.index,
    )
    .slice(0, count)
    .map(({ source }) => localize(source, locale));
}

export function getProject(slug: string, locale: Locale) {
  const source = sources.find((p) => p.slug === slug);
  return source && localize(source, locale);
}

/**
 * Previous/next project with the same status (current or archived), wrapping around the ends of
 * that list. Null when the project is alone in its list: it would only lead back to itself.
 */
export function getAdjacentProjects(slug: string, locale: Locale) {
  const list = sources.find((p) => p.slug === slug)?.isArchive ? archived : current;
  const index = list.findIndex((p) => p.slug === slug);
  const count = list.length;
  if (index === -1 || count < 2) return null;
  return {
    prev: localize(list[(index - 1 + count) % count], locale),
    next: localize(list[(index + 1) % count], locale),
  };
}

/**
 * The color tokens (see globals.css) for a page or section painted in a project's brand color.
 * Derived tokens are listed explicitly because custom properties resolve where they're declared:
 * overriding --color-fg-rgb alone wouldn't update --color-fg on descendants.
 */
export function projectPalette(
  project: Pick<Project, "color" | "tone" | "textColor">,
): Record<string, string> {
  const fg = project.textColor
    ? hexToChannels(project.textColor)
    : project.tone === "light"
      ? "245 245 245"
      : "22 22 22";
  // Text on filled buttons sits on `fg`, so it takes the page color when the brand has its own text color.
  const inverseFg = project.textColor
    ? project.color
    : project.tone === "light"
      ? "#161616"
      : "#f5f5f5";
  // A band that must stand apart from the page (the gallery): lighter on dark brand colors,
  // darker on light ones, so it reads as the same project but a distinct section.
  const section = `color-mix(in srgb, ${project.color} 86%, ${project.tone === "light" ? "white" : "black"})`;
  return {
    "--color-bg": project.color,
    "--color-section": section,
    "--color-fg-rgb": fg,
    "--color-fg": `rgb(${fg})`,
    "--color-muted": `rgb(${fg} / 0.6)`,
    "--color-soft": `rgb(${fg} / 0.7)`,
    "--color-subtle": `rgb(${fg} / 0.75)`,
    "--color-lead": `rgb(${fg} / 0.9)`,
    "--color-hover": `rgb(${fg} / 0.65)`,
    "--color-border": `rgb(${fg} / 0.18)`,
    "--color-border-faint": `rgb(${fg} / 0.1)`,
    "--color-border-strong": `rgb(${fg} / 0.35)`,
    "--color-inverse-bg": `rgb(${fg})`,
    "--color-inverse-fg": inverseFg,
    "--color-placeholder": `rgb(0 0 0 / 0.22)`,
  };
}

/** '#b3995d' → '179 153 93' (space-separated channels for rgb(... / alpha)). */
function hexToChannels(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

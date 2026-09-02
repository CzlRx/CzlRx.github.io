export type LovePost = {
  id: string;
  title: string;
  date: string;
  mood: string;
  content: string;
};

export type LovePhoto = {
  id: string;
  src: string;
  title: string;
  alt: string;
  location: string;
  date: string;
};

export type LovePlace = {
  city: string;
  weather: string;
  temperature: string;
  distance: string;
};

export type LovePlaces = {
  me: LovePlace;
  partner: LovePlace;
};

export const loveConfig = {
  startDate: "2023-02-20",
  startDateLabel: "2023.02.20",
  hero: {
    heading: "独属于我们的",
    highlight: "空间。",
    description: "这里收集两个人的日常、想念和小小的纪念。距离可以被地图量出来，但在一起的每一天，都值得被好好记住。",
    meta: ["ZZY", "❤️", "CZL"],
  },
  people: {
    me: {
      name: "我",
      subtitle: "CzlRx",
      avatar: "/images/avatar.jpg",
    },
    partner: {
      name: "她",
      subtitle: "对象",
      avatar: "/images/partner-avatar.jpg",
    },
  },
  places: {
    me: {
      city: "常州",
      weather: "阴",
      temperature: "26°C",
      distance: "234km",
    },
    partner: {
      city: "南通",
      weather: "阴",
      temperature: "26°C",
      distance: "234km",
    },
  } satisfies LovePlaces,
  timeline: [
    {
      date: "2023-02-20",
      title: "我们在一起了",
      description: "故事从这一天开始，往后的每一页都值得认真收藏。",
    },
    {
      date: "2023-02-26",
      title: "我们的第一次吵架",
      description: "第一次看到你生气时的样子，我既心急又心疼。",
    },
    {
      date: "2023-05-04",
      title: "我们的第一次看电影",
      description: "看的是《铃芽之旅》，最后你看哭了，我帮我擦眼泪。"
    },
    {
      date: "2023-10-21",
      title: "我们的第一次接吻",
      description: "那种心跳加速的感觉，至今仍然记忆犹新。",
    },
  ],
  posts: [
    {
      id: "post-test-2026-09-02",
      title: "测试动态",
      date: "2026.09.02",
      mood: "测试",
      content: "这是一条测试动态，用来检查情侣空间的展示效果。",
    },
  ] as LovePost[],
  photos: [
    { id: "photo-gaokao-tuzhong", src: "/images/高考途中.jpg", title: "高考途中", alt: "高考途中", location: "江苏淮安", date: "20230220" },
    { id: "photo-gaokao-wan-chifan", src: "/images/高考完出去吃饭.jpg", title: "高考完出去吃饭", alt: "高考完出去吃饭", location: "江苏淮安", date: "20230220" },
    { id: "photo-gaokao-qian-he-zhao", src: "/images/高考前合照.jpg", title: "高考前合照", alt: "高考前合照", location: "江苏淮安", date: "20230220" },
    { id: "photo-gaokao-wan-chuquwan", src: "/images/高考完第一次出去玩.jpg", title: "高考完第一次出去玩", alt: "高考完第一次出去玩", location: "江苏淮安", date: "20230220" },
    { id: "photo-gaozhong-meizhao-1", src: "/images/高中时候的美照1.jpg", title: "高中时候的美照1", alt: "高中时候的美照1", location: "江苏淮安", date: "20230220" },
    { id: "photo-gaozhong-meizhao-2", src: "/images/高中时候的美照2.jpg", title: "高中时候的美照2", alt: "高中时候的美照2", location: "江苏淮安", date: "20230220" },
  ] as LovePhoto[],
  secret: {
    code: "20061127",
    title: "写给未来的我们",
    body: "亲爱的我们：\n\n当你们看到这封信时，可能已经经历了许多风风雨雨。无论未来如何，请记住我们曾经的承诺和爱。\n\n愿你们在未来的日子里，依然能够相互扶持，共同面对生活中的挑战。无论是喜悦还是困难，都请紧紧握住彼此的手，不离不弃。\n\n愿我们的爱情像这封信一样，永远铭刻在心中，成为我们前行的动力。",
  },
} as const;

export type LoveConfig = typeof loveConfig;

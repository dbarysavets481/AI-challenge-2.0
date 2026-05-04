const top3Container = document.getElementById("top3");
const listContainer = document.getElementById("list");

const yearFilter = document.getElementById("yearFilter");
const quarterFilter = document.getElementById("quarterFilter");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("search");

const statLabels = {
  education: "Education",
  publicSpeaking: "Public Speaking",
  universityPartners: "University Partners",
  trophy: "Trophy"
};

const statKeys = ["education", "publicSpeaking", "universityPartners", "trophy"];

const employeePhotosById = {
  1: "https://randomuser.me/api/portraits/men/67.jpg",
  2: "https://randomuser.me/api/portraits/women/68.jpg",
  3: "https://randomuser.me/api/portraits/men/46.jpg",
  4: "https://randomuser.me/api/portraits/women/52.jpg",
  5: "https://randomuser.me/api/portraits/men/34.jpg",
  6: "https://randomuser.me/api/portraits/women/33.jpg",
  7: "https://randomuser.me/api/portraits/men/29.jpg",
  8: "https://randomuser.me/api/portraits/women/24.jpg",
  9: "https://randomuser.me/api/portraits/men/15.jpg",
  10: "https://randomuser.me/api/portraits/women/75.jpg"
};

function makeAvatar(initials, from, to) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${from}' />
        <stop offset='100%' stop-color='${to}' />
      </linearGradient>
    </defs>
    <rect width='100' height='100' rx='50' fill='url(#g)' />
    <circle cx='50' cy='38' r='20' fill='rgba(255,255,255,.32)' />
    <rect x='22' y='60' width='56' height='28' rx='14' fill='rgba(255,255,255,.22)' />
    <text x='50' y='56' text-anchor='middle' font-family='Segoe UI, Arial, sans-serif' font-size='21' fill='white' font-weight='700'>${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const activityDatePool = [
  "18-Dec-2025",
  "10-Dec-2025",
  "03-Dec-2025",
  "26-Nov-2025",
  "18-Nov-2025",
  "10-Nov-2025",
  "30-Oct-2025",
  "22-Oct-2025",
  "14-Oct-2025",
  "05-Oct-2025"
];

const activityTitlePool = [
  "Knowledge Sharing Session",
  "Tech Community Workshop",
  "Campus Mentoring Program",
  "Cross-Team Best Practices",
  "Quarterly Chapter Meetup"
];

const activityPointsPool = [6, 8, 10, 12, 14, 16, 18, 20, 24];

function generateActivities(name, categories, seed) {
  const safeCategories = categories.length ? categories : ["Education"];

  return activityTitlePool.map((title, index) => {
    const date = activityDatePool[(seed + index) % activityDatePool.length];
    const points = activityPointsPool[(seed + index) % activityPointsPool.length];
    return {
      title: `[ACT] ${name} - ${title}`,
      category: safeCategories[index % safeCategories.length],
      date,
      points
    };
  });
}

const employees = [
  {
    id: 1,
    name: "Daniel Kowalski",
    role: "Engineering Team Alpha",
    team: "IL.U2.D3.G1",
    score: 540,
    year: "2025",
    quarter: "Q1",
    categories: ["Education", "Public Speaking", "University Partners"],
    stats: { education: 8, publicSpeaking: 5, universityPartners: 4, trophy: 17 },
    activities: [
      {
        title: "[EDU] Github Copilot Workshop (18.12.25)",
        category: "Public Speaking",
        date: "17-Dec-2025",
        points: 64
      },
      {
        title: "[EDU] PowerPoint Karaoke #3: The New Year playlist that saves the holiday",
        category: "Public Speaking",
        date: "16-Dec-2025",
        points: 8
      },
      {
        title: "[EDU] AI Digest #15 16.12.2025",
        category: "Public Speaking",
        date: "15-Dec-2025",
        points: 16
      },
      {
        title: "[EDU] AI Digest #13 18.11.2025",
        category: "Public Speaking",
        date: "18-Nov-2025",
        points: 16
      },
      {
        title: "[EDU] Building a Web for Humans and Machines 12.11.2025",
        category: "Public Speaking",
        date: "12-Nov-2025",
        points: 32
      },
      {
        title: "[EDU] AI Digest #11 21.10.25",
        category: "Public Speaking",
        date: "26-Oct-2025",
        points: 16
      },
      {
        title: "[EDU] AI Digest #10 (16) - First Global Edition. 07.10.25",
        category: "Public Speaking",
        date: "06-Oct-2025",
        points: 32
      },
      {
        title: "[EDU] AI Panel Discussion with Top Managers 06.10.2025",
        category: "Public Speaking",
        date: "05-Oct-2025",
        points: 16
      },
      {
        title: "[EDU] AI Digest #9 23.09.25",
        category: "Public Speaking",
        date: "23-Sep-2025",
        points: 16
      }
    ],
    avatar: makeAvatar("DK", "#6095d7", "#2f4f9f")
  },
  {
    id: 2,
    name: "Anna Nowak",
    role: "Management Team Apex",
    team: "PL.U1.D1.G2",
    score: 328,
    year: "2025",
    quarter: "Q2",
    categories: ["Public Speaking", "University Partners"],
    stats: { education: 2, publicSpeaking: 8, universityPartners: 4, trophy: 10 },
    activities: [
      {
        title: "[UP] Mentoring Day at Poznan University",
        category: "University Partners",
        date: "14-Dec-2025",
        points: 24
      },
      {
        title: "[PS] Women in Tech Leadership Q&A",
        category: "Public Speaking",
        date: "09-Dec-2025",
        points: 16
      },
      {
        title: "[UP] Campus Hiring Session #2",
        category: "University Partners",
        date: "27-Nov-2025",
        points: 12
      },
      {
        title: "[PS] Engineering Growth Talks: Team Rituals",
        category: "Public Speaking",
        date: "13-Nov-2025",
        points: 8
      },
      {
        title: "[UP] Faculty Roundtable: Product Skills",
        category: "University Partners",
        date: "29-Oct-2025",
        points: 20
      },
      {
        title: "[PS] Quarterly All-Hands Demo Host",
        category: "Public Speaking",
        date: "11-Oct-2025",
        points: 10
      }
    ],
    avatar: makeAvatar("AN", "#5f89ca", "#33588b")
  },
  {
    id: 3,
    name: "Tomasz Zieliński",
    role: "QA Team Bravo",
    team: "FR.U1.D1.G2",
    score: 320,
    year: "2025",
    quarter: "Q3",
    categories: ["Education", "Public Speaking"],
    stats: { education: 7, publicSpeaking: 2, universityPartners: 0, trophy: 1 },
    activities: [
      {
        title: "[EDU] QA Automation Basics for New Joiners",
        category: "Education",
        date: "13-Dec-2025",
        points: 18
      },
      {
        title: "[PS] Test Strategy Lightning Talk",
        category: "Public Speaking",
        date: "04-Dec-2025",
        points: 8
      },
      {
        title: "[EDU] API Testing Deep Dive Workshop",
        category: "Education",
        date: "20-Nov-2025",
        points: 20
      },
      {
        title: "[EDU] Playwright Best Practices Session",
        category: "Education",
        date: "07-Nov-2025",
        points: 16
      },
      {
        title: "[PS] QA Chapter Monthly Presentation",
        category: "Public Speaking",
        date: "24-Oct-2025",
        points: 6
      },
      {
        title: "[EDU] Bug Bash Facilitation",
        category: "Education",
        date: "10-Oct-2025",
        points: 12
      }
    ],
    avatar: makeAvatar("TZ", "#9a8bc7", "#4d3f8b")
  },
  {
    id: 4,
    name: "Marta Lewandowska",
    role: "QA Team Charlie",
    team: "DE.U3.D2.G1",
    score: 322,
    year: "2025",
    quarter: "Q4",
    categories: ["Education", "University Partners"],
    stats: { education: 7, publicSpeaking: 0, universityPartners: 3, trophy: 1 },
    activities: [
      {
        title: "[EDU] Quality Engineering Career Track Session",
        category: "Education",
        date: "12-Dec-2025",
        points: 16
      },
      {
        title: "[UP] Technical Interview Simulation at Gdansk Tech",
        category: "University Partners",
        date: "28-Nov-2025",
        points: 20
      },
      {
        title: "[EDU] Shift-Left Testing Workshop",
        category: "Education",
        date: "15-Nov-2025",
        points: 14
      },
      {
        title: "[UP] Student Hackathon Jury Member",
        category: "University Partners",
        date: "30-Oct-2025",
        points: 10
      },
      {
        title: "[EDU] Regression Planning Bootcamp",
        category: "Education",
        date: "18-Oct-2025",
        points: 12
      },
      {
        title: "[UP] University Syllabus Feedback Session",
        category: "University Partners",
        date: "03-Oct-2025",
        points: 8
      }
    ],
    avatar: makeAvatar("ML", "#83a8b7", "#406f86")
  },
  {
    id: 5,
    name: "Jakub Mazur",
    role: "QA Team Delta",
    team: "BY.U1.DQA2.T1",
    score: 304,
    year: "2025",
    quarter: "Q1",
    categories: ["Education"],
    stats: { education: 7, publicSpeaking: 0, universityPartners: 0, trophy: 0 },
    activities: [
      {
        title: "[EDU] SQL for Testers Crash Course",
        category: "Education",
        date: "11-Dec-2025",
        points: 12
      },
      {
        title: "[EDU] Defect Triage Playbook Update",
        category: "Education",
        date: "25-Nov-2025",
        points: 8
      },
      {
        title: "[EDU] Test Case Writing Clinic",
        category: "Education",
        date: "09-Nov-2025",
        points: 10
      },
      {
        title: "[EDU] Mobile Testing Intro Session",
        category: "Education",
        date: "22-Oct-2025",
        points: 6
      },
      {
        title: "[EDU] Exploratory Testing Workshop",
        category: "Education",
        date: "08-Oct-2025",
        points: 14
      },
      {
        title: "[EDU] QA Knowledge Sharing #5",
        category: "Education",
        date: "24-Sep-2025",
        points: 9
      }
    ],
    avatar: makeAvatar("JM", "#6db9b2", "#2a7280")
  },
  {
    id: 6,
    name: "Natalia Kaczmarek",
    role: "Engineering Team Echo",
    team: "BY.U1.D1.G2",
    score: 296,
    year: "2025",
    quarter: "Q2",
    categories: ["Education", "Public Speaking", "University Partners"],
    stats: { education: 2, publicSpeaking: 3, universityPartners: 1, trophy: 7 },
    activities: [
      {
        title: "[PS] Backend Architecture Brown Bag",
        category: "Public Speaking",
        date: "10-Dec-2025",
        points: 14
      },
      {
        title: "[EDU] JavaScript Performance Masterclass",
        category: "Education",
        date: "29-Nov-2025",
        points: 16
      },
      {
        title: "[UP] Student Mentorship Office Hours",
        category: "University Partners",
        date: "17-Nov-2025",
        points: 8
      },
      {
        title: "[PS] Engineering Podcast Guest Episode",
        category: "Public Speaking",
        date: "31-Oct-2025",
        points: 12
      },
      {
        title: "[EDU] Intro to Distributed Systems",
        category: "Education",
        date: "19-Oct-2025",
        points: 10
      },
      {
        title: "[PS] Sprint Demo Narration",
        category: "Public Speaking",
        date: "04-Oct-2025",
        points: 6
      }
    ],
    avatar: makeAvatar("NK", "#7e95c8", "#3f598f")
  },
  {
    id: 7,
    name: "Piotr Wójcik",
    role: "Product Team Foxtrot",
    team: "PL.U1.DA1.T2",
    score: 284,
    year: "2025",
    quarter: "Q3",
    categories: ["Public Speaking", "University Partners"],
    stats: { education: 1, publicSpeaking: 4, universityPartners: 3, trophy: 6 },
    activities: [
      {
        title: "[UP] Data Careers Day at Lodz University",
        category: "University Partners",
        date: "15-Dec-2025",
        points: 18
      },
      {
        title: "[PS] Product Metrics AMA",
        category: "Public Speaking",
        date: "06-Dec-2025",
        points: 10
      },
      {
        title: "[UP] Internship Program Kickoff",
        category: "University Partners",
        date: "22-Nov-2025",
        points: 16
      },
      {
        title: "[PS] Storytelling with Data Session",
        category: "Public Speaking",
        date: "08-Nov-2025",
        points: 8
      },
      {
        title: "[UP] Faculty Partnership Sync",
        category: "University Partners",
        date: "21-Oct-2025",
        points: 12
      },
      {
        title: "[PS] Product Town Hall Co-Host",
        category: "Public Speaking",
        date: "05-Oct-2025",
        points: 7
      }
    ],
    avatar: makeAvatar("PW", "#7aa2d2", "#3a5e90")
  },
  {
    id: 8,
    name: "Aleksandra Dąbrowska",
    role: "Data Team Golf",
    team: "PL.U1.D4.G2",
    score: 271,
    year: "2025",
    quarter: "Q4",
    categories: ["Education", "Public Speaking"],
    stats: { education: 5, publicSpeaking: 2, universityPartners: 0, trophy: 4 },
    activities: [
      {
        title: "[EDU] Data Modeling for Product Teams",
        category: "Education",
        date: "13-Dec-2025",
        points: 20
      },
      {
        title: "[PS] Analytics Guild Monthly Talk",
        category: "Public Speaking",
        date: "30-Nov-2025",
        points: 8
      },
      {
        title: "[EDU] ETL Reliability Playbook",
        category: "Education",
        date: "16-Nov-2025",
        points: 14
      },
      {
        title: "[EDU] Query Optimization Office Hours",
        category: "Education",
        date: "02-Nov-2025",
        points: 10
      },
      {
        title: "[PS] Data Platform Roadmap Update",
        category: "Public Speaking",
        date: "19-Oct-2025",
        points: 6
      },
      {
        title: "[EDU] Governance Standards Intro",
        category: "Education",
        date: "01-Oct-2025",
        points: 12
      }
    ],
    avatar: makeAvatar("AD", "#6ea8b6", "#2e6f80")
  },
  {
    id: 9,
    name: "Michał Kamiński",
    role: "Engineering Team Hotel",
    team: "PL.U1.D3.G1",
    score: 259,
    year: "2025",
    quarter: "Q1",
    categories: ["Education", "University Partners"],
    stats: { education: 4, publicSpeaking: 0, universityPartners: 2, trophy: 3 },
    activities: [
      {
        title: "[EDU] Clean Code Dojo Session",
        category: "Education",
        date: "09-Dec-2025",
        points: 14
      },
      {
        title: "[UP] Mentoring Capstone Projects",
        category: "University Partners",
        date: "26-Nov-2025",
        points: 12
      },
      {
        title: "[EDU] API Contract Testing Class",
        category: "Education",
        date: "12-Nov-2025",
        points: 16
      },
      {
        title: "[UP] University Open Lecture",
        category: "University Partners",
        date: "29-Oct-2025",
        points: 8
      },
      {
        title: "[EDU] Pair Programming Workshop",
        category: "Education",
        date: "14-Oct-2025",
        points: 10
      },
      {
        title: "[EDU] Refactoring Clinic #3",
        category: "Education",
        date: "30-Sep-2025",
        points: 9
      }
    ],
    avatar: makeAvatar("MK", "#8e9cc9", "#46538c")
  },
  {
    id: 10,
    name: "Karolina Piotrowska",
    role: "QA Team India",
    team: "PL.U1.DQA3.T1",
    score: 244,
    year: "2025",
    quarter: "Q2",
    categories: ["Education", "Public Speaking", "University Partners"],
    stats: { education: 3, publicSpeaking: 2, universityPartners: 1, trophy: 2 },
    activities: [
      {
        title: "[EDU] Quality Metrics Fundamentals",
        category: "Education",
        date: "08-Dec-2025",
        points: 12
      },
      {
        title: "[PS] Testing Chapter Lightning Round",
        category: "Public Speaking",
        date: "23-Nov-2025",
        points: 8
      },
      {
        title: "[UP] Campus Recruitment Q&A",
        category: "University Partners",
        date: "10-Nov-2025",
        points: 6
      },
      {
        title: "[EDU] Automation Checklist Workshop",
        category: "Education",
        date: "27-Oct-2025",
        points: 14
      },
      {
        title: "[PS] Sprint Review Presenter",
        category: "Public Speaking",
        date: "12-Oct-2025",
        points: 7
      },
      {
        title: "[EDU] Manual Testing Best Practices",
        category: "Education",
        date: "29-Sep-2025",
        points: 10
      }
    ],
    avatar: makeAvatar("KP", "#8ab2c0", "#3d7484")
  }
];

const additionalEmployees = [
  {
    id: 11,
    name: "Lucas Novak",
    role: "Engineering Team Juliet",
    team: "SE.U2.DQA1.T2",
    score: 238,
    year: "2025",
    quarter: "Q3",
    categories: ["Education"],
    stats: { education: 6, publicSpeaking: 0, universityPartners: 0, trophy: 3 },
    avatar: makeAvatar("LN", "#7aa9d8", "#3d6698"),
    photo: "https://randomuser.me/api/portraits/men/11.jpg"
  },
  {
    id: 12,
    name: "Emilia Wisniewska",
    role: "QA Team Kilo",
    team: "NL.U1.DA2.T1",
    score: 234,
    year: "2025",
    quarter: "Q4",
    categories: ["University Partners"],
    stats: { education: 0, publicSpeaking: 0, universityPartners: 7, trophy: 2 },
    avatar: makeAvatar("EW", "#83b6c7", "#437d92"),
    photo: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    id: 13,
    name: "Adam Zielinski",
    role: "Engineering Team Lima",
    team: "NO.U1.D4.G2",
    score: 229,
    year: "2025",
    quarter: "Q2",
    categories: ["Public Speaking"],
    stats: { education: 0, publicSpeaking: 8, universityPartners: 0, trophy: 1 },
    avatar: makeAvatar("AZ", "#92a9dd", "#4f68a2"),
    photo: "https://randomuser.me/api/portraits/men/13.jpg"
  },
  {
    id: 14,
    name: "Sofia Kowalczyk",
    role: "Product Team Mike",
    team: "ES.U3.D3.G1",
    score: 224,
    year: "2025",
    quarter: "Q1",
    categories: ["Education", "University Partners"],
    stats: { education: 4, publicSpeaking: 0, universityPartners: 3, trophy: 2 },
    avatar: makeAvatar("SK", "#7fb3b0", "#3f7773"),
    photo: "https://randomuser.me/api/portraits/women/14.jpg"
  },
  {
    id: 15,
    name: "Mateusz Nowicki",
    role: "Infrastructure Team November",
    team: "IT.U2.DQA3.T1",
    score: 219,
    year: "2025",
    quarter: "Q2",
    categories: ["Education", "Public Speaking"],
    stats: { education: 3, publicSpeaking: 3, universityPartners: 0, trophy: 2 },
    avatar: makeAvatar("MN", "#9ab6d4", "#597ba2"),
    photo: "https://randomuser.me/api/portraits/men/15.jpg"
  },
  {
    id: 16,
    name: "Julia Wrobel",
    role: "Management Team Oscar",
    team: "CZ.U1.D2.G1",
    score: 214,
    year: "2025",
    quarter: "Q3",
    categories: ["Public Speaking", "University Partners"],
    stats: { education: 0, publicSpeaking: 4, universityPartners: 3, trophy: 1 },
    avatar: makeAvatar("JW", "#8db0d1", "#476e9d"),
    photo: "https://randomuser.me/api/portraits/women/16.jpg"
  },
  {
    id: 17,
    name: "Kacper Szymanski",
    role: "QA Team Papa",
    team: "HU.U1.DQA1.T2",
    score: 209,
    year: "2025",
    quarter: "Q4",
    categories: ["Education"],
    stats: { education: 5, publicSpeaking: 0, universityPartners: 0, trophy: 1 },
    avatar: makeAvatar("KS", "#8f9fd5", "#4e62a1"),
    photo: "https://randomuser.me/api/portraits/men/17.jpg"
  },
  {
    id: 18,
    name: "Zuzanna Pawlak",
    role: "Data Team Quebec",
    team: "AT.U2.D2.G3",
    score: 205,
    year: "2025",
    quarter: "Q1",
    categories: ["University Partners"],
    stats: { education: 0, publicSpeaking: 0, universityPartners: 6, trophy: 1 },
    avatar: makeAvatar("ZP", "#7fadc2", "#3f738e"),
    photo: "https://randomuser.me/api/portraits/women/18.jpg"
  },
  {
    id: 19,
    name: "Oskar Wojciechowski",
    role: "Engineering Team Romeo",
    team: "BE.U1.DA2.T1",
    score: 201,
    year: "2025",
    quarter: "Q3",
    categories: ["Public Speaking"],
    stats: { education: 0, publicSpeaking: 6, universityPartners: 0, trophy: 1 },
    avatar: makeAvatar("OW", "#97b4d6", "#557ea9"),
    photo: "https://randomuser.me/api/portraits/men/19.jpg"
  },
  {
    id: 20,
    name: "Lena Dudek",
    role: "Design Team Sierra",
    team: "DK.U3.D5.G1",
    score: 197,
    year: "2025",
    quarter: "Q2",
    categories: ["Education", "Public Speaking", "University Partners"],
    stats: { education: 2, publicSpeaking: 2, universityPartners: 2, trophy: 1 },
    avatar: makeAvatar("LD", "#8bb6c6", "#4a8194"),
    photo: "https://randomuser.me/api/portraits/women/20.jpg"
  },
  {
    id: 21,
    name: "Filip Kaczmarek",
    role: "Engineering Team Tango",
    team: "PT.U2.PM1",
    score: 192,
    year: "2025",
    quarter: "Q4",
    categories: ["Education"],
    stats: { education: 4, publicSpeaking: 0, universityPartners: 0, trophy: 1 },
    avatar: makeAvatar("FK", "#86a5d2", "#47689a"),
    photo: "https://randomuser.me/api/portraits/men/21.jpg"
  },
  {
    id: 22,
    name: "Weronika Krupa",
    role: "Operations Team Uniform",
    team: "GR.U1.DQA2.T3",
    score: 188,
    year: "2025",
    quarter: "Q2",
    categories: ["University Partners", "Public Speaking"],
    stats: { education: 0, publicSpeaking: 3, universityPartners: 4, trophy: 1 },
    avatar: makeAvatar("WK", "#8eb3cf", "#4f759b"),
    photo: "https://randomuser.me/api/portraits/women/22.jpg"
  },
  {
    id: 23,
    name: "Marcin Grabowski",
    role: "Infrastructure Team Victor",
    team: "RO.U2.DA3.T2",
    score: 183,
    year: "2025",
    quarter: "Q1",
    categories: ["Public Speaking"],
    stats: { education: 0, publicSpeaking: 5, universityPartners: 0, trophy: 1 },
    avatar: makeAvatar("MG", "#90abd1", "#54719f"),
    photo: "https://randomuser.me/api/portraits/men/23.jpg"
  },
  {
    id: 24,
    name: "Alicja Jablonska",
    role: "QA Team Whiskey",
    team: "PL.U3.D3.G2",
    score: 179,
    year: "2025",
    quarter: "Q3",
    categories: ["Education", "University Partners"],
    stats: { education: 3, publicSpeaking: 0, universityPartners: 3, trophy: 1 },
    avatar: makeAvatar("AJ", "#87b7bd", "#4a7c83"),
    photo: "https://randomuser.me/api/portraits/women/24.jpg"
  },
  {
    id: 25,
    name: "Pawel Malinowski",
    role: "Engineering Team Xray",
    team: "CH.U1.UX1",
    score: 174,
    year: "2025",
    quarter: "Q2",
    categories: ["Education", "Public Speaking"],
    stats: { education: 2, publicSpeaking: 3, universityPartners: 0, trophy: 1 },
    avatar: makeAvatar("PM", "#8aa4ca", "#4d6794"),
    photo: "https://randomuser.me/api/portraits/men/25.jpg"
  },
  {
    id: 26,
    name: "Hanna Stankiewicz",
    role: "HR Team Yankee",
    team: "SI.U2.D4.G1",
    score: 170,
    year: "2025",
    quarter: "Q4",
    categories: ["University Partners"],
    stats: { education: 0, publicSpeaking: 0, universityPartners: 5, trophy: 1 },
    avatar: makeAvatar("HS", "#8ab7c9", "#4e8197"),
    photo: "https://randomuser.me/api/portraits/women/26.jpg"
  },
  {
    id: 27,
    name: "Damian Rutkowski",
    role: "Security Team Zulu",
    team: "BG.U1.RM1",
    score: 166,
    year: "2025",
    quarter: "Q1",
    categories: ["Public Speaking", "Education"],
    stats: { education: 2, publicSpeaking: 2, universityPartners: 0, trophy: 1 },
    avatar: makeAvatar("DR", "#8da8cf", "#4f6f9d"),
    photo: "https://randomuser.me/api/portraits/men/27.jpg"
  },
  {
    id: 28,
    name: "Kinga Szczepanska",
    role: "Engineering Team Amber",
    team: "HR.U2.D5.G2",
    score: 161,
    year: "2025",
    quarter: "Q3",
    categories: ["Education"],
    stats: { education: 4, publicSpeaking: 0, universityPartners: 0, trophy: 0 },
    avatar: makeAvatar("KS", "#83afca", "#4a7695"),
    photo: "https://randomuser.me/api/portraits/women/28.jpg"
  },
  {
    id: 29,
    name: "Bartosz Lis",
    role: "Product Team Bronze",
    team: "LV.U1.DQA3.T2",
    score: 157,
    year: "2025",
    quarter: "Q2",
    categories: ["Public Speaking", "University Partners"],
    stats: { education: 0, publicSpeaking: 2, universityPartners: 3, trophy: 0 },
    avatar: makeAvatar("BL", "#96b1d2", "#59799f"),
    photo: "https://randomuser.me/api/portraits/men/29.jpg"
  },
  {
    id: 30,
    name: "Monika Ostrowska",
    role: "Agile Team Crystal",
    team: "MT.U3.D3.G3",
    score: 152,
    year: "2025",
    quarter: "Q4",
    categories: ["Education", "University Partners"],
    stats: { education: 2, publicSpeaking: 0, universityPartners: 2, trophy: 0 },
    avatar: makeAvatar("MO", "#89b7c8", "#4a8194"),
    photo: "https://randomuser.me/api/portraits/women/30.jpg"
  }
].map((employee, index) => {
  return {
    ...employee,
    activities: generateActivities(employee.name, employee.categories, employee.score + index)
  };
});

employees.push(...additionalEmployees);

for (const employee of employees) {
  employee.photo = employee.photo || employeePhotosById[employee.id] || null;
}

const expandedRows = new Set();

function icon(name) {
  const icons = {
    star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 14.9 8l6 .9-4.3 4.2 1 5.9L12 16l-5.6 3 1.1-5.9L3 8.9 9.1 8 12 2.5Z"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10v2h2v2c0 2.6-2 4.8-4.6 5A5.8 5.8 0 0 1 13 14.7V17h4v2H7v-2h4v-2.3A5.8 5.8 0 0 1 9.6 12C7 11.8 5 9.6 5 7V5h2V3Zm0 4c0 1.7 1.3 3 3 3V5H7v2Zm10 0V5h-3v5c1.7 0 3-1.3 3-3Z"/></svg>`,
    education: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M3 9.2 12 5l9 4.2-9 4.2L3 9.2Zm4.2 2v3.1c0 1.7 2.2 3.1 4.8 3.1s4.8-1.4 4.8-3.1v-3.1M3.4 9.4v3.9"/></svg>`,
    publicSpeaking: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M4.5 5.5h15v10.2h-15zM12 15.7v4.1m-3 0h6"/></svg>`,
    universityPartners: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.1" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="9" cy="10.2" r="1.2" fill="currentColor"/><circle cx="15" cy="10.2" r="1.2" fill="currentColor"/><path d="M8.4 14.1c.9 1.2 2.1 1.8 3.6 1.8 1.5 0 2.7-.6 3.6-1.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`
  };

  return icons[name];
}

function renderAvatarImage(employee, className) {
  const src = employee.photo || employee.avatar;
  return `<img class="${className}" src="${src}" data-fallback="${employee.avatar}" alt="${employee.name} avatar" onerror="if (this.dataset.fallback && this.src !== this.dataset.fallback) { this.src = this.dataset.fallback; }"/>`;
}

function toSorted(list) {
  return [...list].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.name.localeCompare(b.name);
  });
}

function getFilteredEmployees() {
  const yearValue = yearFilter.value;
  const quarterValue = quarterFilter.value;
  const categoryValue = categoryFilter.value;
  const searchValue = searchInput.value.trim().toLowerCase();

  return employees.filter((employee) => {
    const yearMatch = yearValue === "all" || employee.year === yearValue;
    const quarterMatch = quarterValue === "all" || employee.quarter === quarterValue;
    const categoryMatch = categoryValue === "all" || employee.categories.includes(categoryValue);
    const searchMatch = employee.name.toLowerCase().includes(searchValue);
    return yearMatch && quarterMatch && categoryMatch && searchMatch;
  });
}

function renderTop3(sortedList) {
  if (!sortedList.length) {
    top3Container.innerHTML = "<div class=\"empty-state\">No employees match your filters.</div>";
    return;
  }

  const slots = [
    { place: 2, employee: sortedList[1] || null },
    { place: 1, employee: sortedList[0] || null },
    { place: 3, employee: sortedList[2] || null }
  ];

  top3Container.innerHTML = slots
    .map((slot) => {
      if (!slot.employee) {
        return "<div></div>";
      }

      return `
        <article class="podium-card place-${slot.place}">
          <div class="avatar-wrap">
            ${renderAvatarImage(slot.employee, "podium-avatar")}
            <span class="rank-badge">${slot.place}</span>
          </div>
          <p class="podium-name">${slot.employee.name}</p>
          <p class="podium-meta">${slot.employee.role} (${slot.employee.team})</p>
          <div class="score-pill">
            <span class="icon">${icon("star")}</span>
            <span>${slot.employee.score}</span>
          </div>
          <div class="pedestal">${slot.place}</div>
        </article>
      `;
    })
    .join("");
}

function renderRows(sortedList) {
  if (!sortedList.length) {
    listContainer.innerHTML = "<div class=\"empty-state\">No leaderboard rows to display.</div>";
    return;
  }

  listContainer.innerHTML = sortedList
    .map((employee, index) => {
      const rank = index + 1;
      const isExpanded = expandedRows.has(employee.id);

      const statItems = statKeys
        .map((key) => {
          const value = employee.stats[key] || 0;
          if (value <= 0) {
            return "";
          }

          return `
            <div class="stat-item">
              <div class="stat-icon" title="${statLabels[key]}">${icon(key)}</div>
              <p class="stat-value">${value}</p>
            </div>
          `;
        })
        .join("");

      return `
        <article class="row-card ${isExpanded ? "expanded" : ""}">
          <div class="row-main">
            <div class="row-left">
              <span class="row-rank">${rank}</span>
              ${renderAvatarImage(employee, "row-avatar")}
              <div>
                <p class="person-name">${employee.name}</p>
                <p class="person-meta">${employee.role} (${employee.team})</p>
              </div>
            </div>

            <div class="row-right">
              <div class="stat-grid">${statItems}</div>
              <div class="row-divider" aria-hidden="true"></div>
              <div class="total">
                <span class="total-label">TOTAL</span>
                <span class="total-score">
                  <span class="icon">${icon("star")}</span>
                  ${employee.score}
                </span>
              </div>
              <button
                class="expand-btn"
                type="button"
                data-id="${employee.id}"
                aria-label="Toggle details for ${employee.name}"
                aria-expanded="${isExpanded ? "true" : "false"}">
                ${icon("chevron")}
              </button>
            </div>
          </div>

          ${renderExpandedDetails(employee, isExpanded)}
        </article>
      `;
    })
    .join("");
}

function renderExpandedDetails(employee, isExpanded) {
  if (!isExpanded) {
    return "";
  }

  const activities = employee.activities || [];
  const rows = activities
    .map((activity) => {
      return `
        <tr>
          <td class="activity-col">${activity.title}</td>
          <td class="category-col"><span class="activity-badge">${activity.category}</span></td>
          <td class="date-col">${activity.date}</td>
          <td class="points-col">${formatPoints(activity.points)}</td>
        </tr>
      `;
    })
    .join("");

  const emptyRow = `
    <tr>
      <td class="activity-col" colspan="4">No activity records yet.</td>
    </tr>
  `;

  return `
    <div class="row-details">
      <h4 class="detail-title">RECENT ACTIVITY</h4>
      <div class="activity-table-wrap">
        <table class="activity-table">
          <thead>
            <tr>
              <th>ACTIVITY</th>
              <th>CATEGORY</th>
              <th>DATE</th>
              <th>POINTS</th>
            </tr>
          </thead>
          <tbody>
            ${rows || emptyRow}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function formatPoints(points) {
  const numeric = Number(points);
  if (Number.isFinite(numeric)) {
    return numeric > 0 ? `+${numeric}` : `${numeric}`;
  }

  const text = String(points);
  return text.startsWith("+") ? text : `+${text}`;
}

function render() {
  const filtered = getFilteredEmployees();
  const sorted = toSorted(filtered);

  const visibleIds = new Set(sorted.map((employee) => employee.id));
  for (const id of [...expandedRows]) {
    if (!visibleIds.has(id)) {
      expandedRows.delete(id);
    }
  }

  renderTop3(sorted);
  renderRows(sorted);
}

function setupEvents() {
  [yearFilter, quarterFilter, categoryFilter].forEach((control) => {
    control.addEventListener("change", render);
  });

  searchInput.addEventListener("input", render);

  listContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".expand-btn");
    if (!button) {
      return;
    }

    const employeeId = Number(button.dataset.id);
    if (expandedRows.has(employeeId)) {
      expandedRows.delete(employeeId);
    } else {
      expandedRows.add(employeeId);
    }

    render();
  });
}

setupEvents();
render();
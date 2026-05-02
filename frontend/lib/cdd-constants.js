import { Monitor, Smartphone, Palette, Brain, Terminal, GraduationCap, LayoutDashboard, BookOpen, Users } from 'lucide-react';

export const BRANCHES = [
  { short: "CSE", full: "Computer Science Engineering" },
  { short: "ETC", full: "Electronics & Telecommunication" },
  { short: "CE", full: "Civil Engineering" },
  { short: "AE", full: "Automobile Engineering" },
  { short: "ME", full: "Mechanical Engineering" },
  { short: "EE", full: "Electrical Engineering" }
];

export const PROGRAMS = [
  { title: "Web Development", description: "Master modern frameworks like React, Next.js, and build stunning responsive websites.", icon: Monitor },
  { title: "App Development", description: "Create cross-platform mobile applications using Flutter and React Native.", icon: Smartphone },
  { title: "UI/UX Design", description: "Learn the art of user experience and interface design with Figma and Adobe XD.", icon: Palette },
  { title: "AI & Machine Learning", description: "Dive into the future with Python, TensorFlow, and neural networks.", icon: Brain },
  { title: "Competitive Coding", description: "Sharpen your algorithmic skills and ace technical interviews.", icon: Terminal },
  { title: "Open Source", description: "Contribute to real-world open source projects and build your portfolio.", icon: Users },
];

export const FACULTY = [
  {
    name: "Dr. Debasis Mohapatra",
    role: "Faculty In-charge",
    specialty: "Asst. Professor, CSE Dept.",
    image: "/debasish_sir.png",
  },
  {
    name: "Dr. Sourav Kumar Bhoi",
    role: "Faculty In-charge",
    specialty: "Asst. Professor, CSE Dept.",
    image: "/sourav_sir.png",
  },
  {
    name: "Dr. Kalyan Kumar Jena",
    role: "Faculty In-charge",
    specialty: "Asst. Professor, CSE Dept.",
    image: "/kalyan-kumar-jena.jpeg",
  },
];

export const EVENTS = [
  { id: 1, title: "CodeKriti 2025", date: "March 15, 2025", description: "Our annual 24-hour hackathon bringing together the brightest minds.", category: "Competition" },
  { id: 2, title: "UI Design Workshop", date: "March 22, 2025", description: "A hands-on session on creating beautiful interfaces with Figma.", category: "Workshop" },
  { id: 3, title: "Tech Talk: Future of AI", date: "April 05, 2025", description: "Guest lecture by industry experts on the evolving landscape of AI.", category: "Seminar" },
  { id: 4, title: "Open Source Summer", date: "May 01, 2025", description: "Kickstarting our summer contribution program for open source projects.", category: "Program" },
];

export const PROJECTS = [
  {
    id: 1, name: "Quizmaster AI", category: "AI Quiz Engine",
    description: "Intelligent quiz generation with adaptive difficulty levels for competitions.",
    icon: GraduationCap, color: "purple",
    tech: ["Next.js 15", "TypeScript", "Supabase", "Google Genkit"],
    link: "https://quizzer-five-phi.vercel.app/",
    image: "/projects/quizmaster_ai.png",
    type: "single",
  },
  {
    id: 2, name: "College ERP", category: "Enterprise System",
    description: "Centralized platform for academic and administrative operations.",
    icon: LayoutDashboard, color: "blue",
    image: "/projects/college_erp.png",
    type: "dual",
    versions: [
      { name: "v1.0", tech: ["Next.js 14", "TypeScript", "Supabase"], link: "https://school-erpsuppa.vercel.app/" },
      { name: "CampusConnect", tech: ["Next.js 14", "Radix UI", "Supabase"], link: "https://campusconnect-2.vercel.app/" },
    ],
  },
  {
    id: 3, name: "LearnOverse", category: "AI Study Platform",
    description: "AI-powered study companion with summaries, mindmaps, and Q&A.",
    icon: BookOpen, color: "green",
    tech: ["Next.js 16", "TypeScript", "Gemini API", "LangChain"],
    link: "https://learnoverse2-0.vercel.app/",
    image: "/projects/learnoverse.png",
    type: "single",
  },
  {
    id: 4, name: "Skillplot", category: "Peer Learning",
    description: "Peer-to-peer skill exchange platform for collaborative growth.",
    icon: Users, color: "orange",
    tech: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    link: "https://skill-pilot-three.vercel.app/",
    image: "/projects/skillplot.png",
    type: "single",
  },
];

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBVL19cmqrGU48fl1p3-ztLsqfysAKm2fPFO1Pokv079fzzTr5YF72tdPjdNe3d_ZL/exec';

export const TEAM_MEMBERS = [
  { name: "Omkar Padhy", role: "Secretary", description: "Leading the club's administration and strategic planning.", image: "/team_alumini/omkar.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/omkar-padhy-", email: "omkarpadhy88@gmail.com", instagram: "https://www.instagram.com/omkar_888._/" },
  { name: "Bikash Ranjan Hota", role: "Management Head", description: "Managing the club's social media presence and content.", image: "/team_alumini/bikash.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/bikash-ranjan-hota-91b38b2b6", email: "bikashranjanhota68@gmail.com", instagram: "https://www.instagram.com/bikash_ranjann_/" },
  { name: "Subhashree Panda", role: "Head Coord. (Girls)", description: "Managing and coordinating technical activities for girls.", image: "/team_alumini/subhshree.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/subhashree-panda-391668290", email: "subhashreeofficial07@gmail.com", instagram: "https://www.instagram.com/subhhuu_09/" },
  { name: "Debasish Sahu", role: "Public Relations Coordinator", description: "Handling public relations and external communications.", image: "/team_alumini/debasis.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/debasish-sahu-b35635250", email: "sahudebasish327@gmail.com", instagram: "https://www.instagram.com/_debasishsahu_/" },
  { name: "Sarthak Mishra", role: "Coordinator", description: "Supporting club events and student engagement.", image: "/team_alumini/sarthak.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/sarthak-mishra-b99bb0331", email: "sarthakmishra9420@gmail.com", instagram: "https://www.instagram.com/sarthakmishra05/" },
  { name: "Anisha Parida", role: "Coordinator", description: "Facilitating workshops and club activities.", image: "/team_alumini/anisha_didi.jpg", imagePosition: "center top", category: "Team", linkedin: "https://www.linkedin.com/in/anisha-parida-20780b2b0", email: "anishaparida04@gmail.com", instagram: "https://www.instagram.com/aisha_242004" },
  { name: "Saurav Pratap Singh", role: "Founder", description: "Established the CDD Club and laid the foundation for technical excellence.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765901413/Founder_vnqqps.jpg", category: "Founder", linkedin: "https://www.linkedin.com/in/saurav269" },
  { name: "Baibhab Sahu", role: "Alumni", description: "", image: "/team_alumini/baibhab_bhai.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/baibhabsahu07", email: "ankur2002666@gmail.com", instagram: "https://www.instagram.com/baibhabsahu/" },
  { name: "Chhayakanta Dash", role: "Alumni", description: "", image: "/team_alumini/Chaya_bhai.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/chhayakantadash", email: "chhayakantdash143@gmail.com", instagram: "https://www.instagram.com/mr.chhayakant/" },
  { name: "Pranjal Panda", role: "Alumni", description: "", image: "/team_alumini/pranjal_didi.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/pranjal-panda-236191317", email: "pranjalpanda047@gmail.com", instagram: "https://www.instagram.com/pranjal.panda_/" },
  { name: "K Rabindra Nath Senapaty", role: "Alumni", description: "", image: "/team_alumini/rabindra_bhai.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/krabindranathsenapaty", email: "rabindrasenapaty2003@gmail.com", instagram: "https://www.instagram.com/rabindra_senapaty/" },
  { name: "P Soumya Sundar Subudhi", role: "Alumni", description: "", image: "/team_alumini/soumya_bhai.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/p-soumya-sundar-subudhi", email: "p.soumyasundars@gmail.com", instagram: "https://www.instagram.com/____s.oumya____/" },
  { name: "Debadatta Dash", role: "Alumni", description: "", image: "/team_alumini/debadutta_bhai.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/debadatta-dash-45b14725b", instagram: "https://www.instagram.com/_orb.__deb/" },
  { name: "Shubham Ranjan Sahoo", role: "Alumni", description: "", image: "/team_alumini/subham_sahoo.png", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/shubham-ranjan-sahoo-7a1982294" },
  { name: "Swagat Prasad Nanda", role: "Alumni", description: "", image: "/team_alumini/swagat_bhai.png", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/swagat-prasad-nanda", email: "swagatprasad3344@gmail.com" },
  { name: "Subham Kumar Padhy", role: "Alumni", description: "", image: "/team_alumini/subham_padhy.png", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/subham-kumar-padhy", email: "subhamkumarpadhy14@gmail.com" },
  { name: "Subrat Kumar Sahu", role: "Alumni", description: "", image: "/team_alumini/subrat_bhai.png", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/subratkumarsahu", email: "subratsahu1808@gmail.com" },
  { name: "Alisha Rani Nanda", role: "Alumni", description: "", image: "/team_alumini/Elisha_didi.jpeg", imagePosition: "center bottom", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/alisha-rani-nanda-935681235" },
  { name: "Purnima Prusty", role: "Alumni", description: "", image: "/team_alumini/Purnima_didi.jpeg", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/purnima-prusty-37491b24a", email: "purnimaprusty2003@gmail.com" },
];

export const CLUB_SOCIALS = {
  instagram: "https://www.instagram.com/cdd_club_pmec",
  linkedin: "https://www.linkedin.com/company/coding-design-and-development/posts/?feedView=all",
  github: "https://github.com/CodingClubPMEC",
  x: "https://x.com/cddclubpmec",
};

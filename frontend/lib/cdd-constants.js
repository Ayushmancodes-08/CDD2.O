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
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&auto=format&fit=crop",
  },
  {
    name: "Dr. Sourav Kumar Bhoi",
    role: "Faculty In-charge",
    specialty: "Asst. Professor, CSE Dept.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop",
  },
  {
    name: "Kalyan Kumar Jena",
    role: "Faculty In-charge",
    specialty: "Asst. Professor, CSE Dept.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop",
    type: "single",
  },
  {
    id: 2, name: "College ERP", category: "Enterprise System",
    description: "Centralized platform for academic and administrative operations.",
    icon: LayoutDashboard, color: "blue",
    image: "https://images.unsplash.com/photo-1454165833762-02ad50e8958d?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
    type: "single",
  },
  {
    id: 4, name: "Skillplot", category: "Peer Learning",
    description: "Peer-to-peer skill exchange platform for collaborative growth.",
    icon: Users, color: "orange",
    tech: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    link: "https://skill-pilot-three.vercel.app/",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    type: "single",
  },
];

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBVL19cmqrGU48fl1p3-ztLsqfysAKm2fPFO1Pokv079fzzTr5YF72tdPjdNe3d_ZL/exec';

export const TEAM_MEMBERS = [
  { name: "Omkar Padhy", role: "Secretary", description: "Leading the club's administration and strategic planning.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765900161/omkarpadhy_jfqcaf.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/omkar-padhy-", email: "omkarpadhy88@gmail.com", instagram: "https://www.instagram.com/omkar_888._/" },
  { name: "Bikash Ranjan Hota", role: "Management Head", description: "Managing the club's social media presence and content.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765900159/bikashranjan_mg1s8g.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/bikash-ranjan-hota-91b38b2b6", email: "bikashranjanhota68@gmail.com", instagram: "https://www.instagram.com/bikash_ranjann_/" },
  { name: "Subhashree Panda", role: "Head Coord. (Girls)", description: "Managing and coordinating technical activities for girls.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765900162/subhashreepanda_cgqvbk.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/subhashree-panda-391668290", email: "subhashreeofficial07@gmail.com", instagram: "https://www.instagram.com/subhhuu_09/" },
  { name: "Debasish Sahu", role: "Public Relations Coordinator", description: "Handling public relations and external communications.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765900507/debasishsahu_oauauh.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/debasish-sahu-b35635250", email: "sahudebasish327@gmail.com", instagram: "https://www.instagram.com/_debasishsahu_/" },
  { name: "Sarthak Mishra", role: "Coordinator", description: "Supporting club events and student engagement.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765900160/sarthakmishra_m60tup.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/sarthak-mishra-b99bb0331", email: "sarthakmishra9420@gmail.com", instagram: "https://www.instagram.com/sarthakmishra05/" },
  { name: "Anisha Parida", role: "Coordinator", description: "Facilitating workshops and club activities.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765900160/anishaparida_drduzm.jpg", category: "Team", linkedin: "https://www.linkedin.com/in/anisha-parida-20780b2b0", email: "anishaparida04@gmail.com", instagram: "https://www.instagram.com/aisha_242004" },
  { name: "Saurav Pratap Singh", role: "Founder", description: "Established the CDD Club and laid the foundation for technical excellence.", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765901413/Founder_vnqqps.jpg", category: "Founder", linkedin: "https://www.linkedin.com/in/saurav269" },
  { name: "Baibhab Sahu", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400,y_-30/v1765901395/baibhabhai_zwx018.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/baibhabsahu07", email: "ankur2002666@gmail.com", instagram: "https://www.instagram.com/baibhabsahu/" },
  { name: "Chhayakanta Dash", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765901886/WhatsApp_Image_2025-12-16_at_21.47.19_c079095d_ywncmo.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/chhayakantadash", email: "chhayakantdash143@gmail.com", instagram: "https://www.instagram.com/mr.chhayakant/" },
  { name: "Pranjal Panda", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765901395/pranjaldidi_gee5rq.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/pranjal-panda-236191317", email: "pranjalpanda047@gmail.com", instagram: "https://www.instagram.com/pranjal.panda_/" },
  { name: "K Rabindra Nath Senapaty", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765901400/rabindrabhai_yamgkh.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/krabindranathsenapaty", email: "rabindrasenapaty2003@gmail.com", instagram: "https://www.instagram.com/rabindra_senapaty/" },
  { name: "P Soumya Sundar Subudhi", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765901393/saumya_wp8ayd.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/p-soumya-sundar-subudhi", email: "p.soumyasundars@gmail.com", instagram: "https://www.instagram.com/____s.oumya____/" },
  { name: "Debadatta Dash", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765901396/debbhai_jocjog.jpg", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/debadatta-dash-45b14725b", instagram: "https://www.instagram.com/_orb.__deb/" },
  { name: "Shubham Ranjan Sahoo", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400,z_1.4/v1765947270/subham_kzbgqh.png", category: "Alumni", batch: "2026", linkedin: "https://www.linkedin.com/in/shubham-ranjan-sahoo-7a1982294" },
  { name: "Swagat Prasad Nanda", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765904101/swagat_edf077.jpg", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/swagat-prasad-nanda", email: "swagatprasad3344@gmail.com" },
  { name: "Subham Kumar Padhy", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400/v1765945577/subham_btmxx6.png", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/subham-kumar-padhy", email: "subhamkumarpadhy14@gmail.com" },
  { name: "Subrat Kumar Sahu", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400,z_1.4/v1765947161/subhrat_hrx2kj.png", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/subratkumarsahu", email: "subratsahu1808@gmail.com" },
  { name: "Alisha Rani Nanda", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/c_fill,g_face,w_400,h_400,z_1.4/v1765946458/Alisha_x4clw3.jpg", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/alisha-rani-nanda-935681235" },
  { name: "Purnima Prusty", role: "Alumni", description: "", image: "https://res.cloudinary.com/dlanrr3jl/image/upload/v1765904106/purnima_ca3fzw.jpg", category: "Alumni", batch: "2025", linkedin: "https://www.linkedin.com/in/purnima-prusty-37491b24a", email: "purnimaprusty2003@gmail.com" },
];

export const CLUB_SOCIALS = {
  instagram: "https://www.instagram.com/cdd_club_pmec",
  linkedin: "https://www.linkedin.com/company/coding-design-and-development/posts/?feedView=all",
  github: "https://github.com/CodingClubPMEC",
  x: "https://x.com/cddclubpmec",
};

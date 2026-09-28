import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  DoorClosed,
  DoorOpen,
  Filter,
  Gauge,
  GraduationCap,
  HeartPulse,
  Info,
  LayoutDashboard,
  LibraryBig,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Navigation,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  Wind,
  X,
} from "lucide-react";

type Subject = {
  name: string;
  code: string;
  attended: number;
  conducted: number;
  color: string;
  remaining: number;
};

type Section = {
  id: string;
  name: string;
  batch: string;
  attended: number;
  conducted: number;
  dailyClasses: number[];
  subjects: Subject[];
  tutor: string;
  roomWing: string;
};

type Room = {
  id: string;
  floor: string;
  floorLabel: string;
  ac: boolean;
  occupied: boolean;
  currentClass: string;
  section: string;
  nextClass: string;
  nextTime: string;
  minutesLeft: number;
  accent: string;
};

type ChatMessage = { role: "assistant" | "user"; text: string };

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: BookOpenCheck },
  { id: "rooms", label: "Room Finder", icon: DoorOpen },
  { id: "advisor", label: "Attendance Advisor", icon: MessageCircle },
];

const colors = ["#5B5FEF", "#2DAA89", "#F29C5B", "#D95C83", "#6B8FD6"];
const sectionNames = [
  ["CSE", "A"],
  ["CSE", "B"],
  ["ECE", "A"],
  ["ECE", "B"],
  ["ME", "A"],
  ["ME", "B"],
  ["IT", "A"],
  ["IT", "B"],
  ["CIVIL", "A"],
  ["CIVIL", "B"],
];

const subjectCatalog: Record<string, string[]> = {
  CSE: ["Data Structures", "Operating Systems", "Database Systems", "Computer Networks", "Chemistry"],
  ECE: ["Signals & Systems", "Digital Logic", "Electronics", "Engineering Maths", "Chemistry"],
  ME: ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Engineering Maths", "Materials Science"],
  IT: ["Web Engineering", "Cloud Computing", "Data Mining", "Cyber Security", "Chemistry"],
  CIVIL: ["Structural Analysis", "Surveying", "Geotechnical Engg.", "Hydraulics", "Engineering Maths"],
};

const subjectCodes: Record<string, string[]> = {
  CSE: ["CSE201", "CSE203", "CSE205", "CSE207", "CHY101"],
  ECE: ["ECE201", "ECE203", "ECE205", "MAT201", "CHY101"],
  ME: ["MEC201", "MEC203", "MEC205", "MAT201", "MEC207"],
  IT: ["ITE201", "ITE203", "ITE205", "ITE207", "CHY101"],
  CIVIL: ["CIV201", "CIV203", "CIV205", "CIV207", "MAT201"],
};

function createSections(): Section[] {
  return sectionNames.map(([branch, division], index) => {
    const subjectNames = subjectCatalog[branch];
    const base = index === 0 ? 48 : 69 + ((index * 7) % 18);
    const conducted = index === 0 ? 116 : 88 + ((index * 5) % 16);
    const attended = Math.round((conducted * base) / 100);
    return {
      id: `${branch.toLowerCase()}-${division.toLowerCase()}`,
      name: `${branch} ${division}`,
      batch: `2024–28 · ${branch}`,
      attended,
      conducted,
      dailyClasses: [0, 4 + (index % 2), 5, 4 + ((index + 1) % 2), 5, 4, 0],
      tutor: ["Dr. Meera Nair", "Prof. Arjun Rao", "Dr. Kavya Menon", "Prof. S. Iyer", "Dr. Nikhil Bose"][index % 5],
      roomWing: ["North Wing", "North Wing", "East Wing", "East Wing", "South Wing"][index % 5],
      subjects: subjectNames.map((name, subjectIndex) => {
        const pct = Math.max(38, Math.min(98, base + [7, -4, 3, -8, 5][subjectIndex] + ((index * 3 + subjectIndex) % 7) - 3));
        const subjectConducted = 16 + ((index + subjectIndex) % 7) * 2;
        return {
          name,
          code: subjectCodes[branch][subjectIndex],
          attended: Math.round((subjectConducted * pct) / 100),
          conducted: subjectConducted,
          color: colors[subjectIndex],
          remaining: 12 + ((index * 3 + subjectIndex * 2) % 10),
        };
      }),
    };
  });
}

const sections = createSections();

const rooms: Room[] = [
  { id: "G-101", floor: "ground", floorLabel: "Ground floor", ac: true, occupied: true, currentClass: "Data Structures", section: "CSE A", nextClass: "Open study block", nextTime: "12:35 PM", minutesLeft: 17, accent: "violet" },
  { id: "G-102", floor: "ground", floorLabel: "Ground floor", ac: false, occupied: false, currentClass: "Available now", section: "—", nextClass: "Engineering Maths", nextTime: "01:25 PM", minutesLeft: 0, accent: "mint" },
  { id: "G-103", floor: "ground", floorLabel: "Ground floor", ac: true, occupied: true, currentClass: "Chemistry Lab", section: "CSE B", nextClass: "Available", nextTime: "02:15 PM", minutesLeft: 17, accent: "coral" },
  { id: "1-201", floor: "first", floorLabel: "First floor", ac: true, occupied: false, currentClass: "Available now", section: "—", nextClass: "Database Systems", nextTime: "01:25 PM", minutesLeft: 0, accent: "mint" },
  { id: "1-202", floor: "first", floorLabel: "First floor", ac: false, occupied: true, currentClass: "Signals & Systems", section: "ECE A", nextClass: "Available", nextTime: "12:35 PM", minutesLeft: 17, accent: "violet" },
  { id: "1-204", floor: "first", floorLabel: "First floor", ac: true, occupied: false, currentClass: "Available now", section: "—", nextClass: "OS Lab", nextTime: "02:15 PM", minutesLeft: 0, accent: "mint" },
  { id: "2-301", floor: "second", floorLabel: "Second floor", ac: true, occupied: true, currentClass: "Cloud Computing", section: "IT A", nextClass: "Available", nextTime: "12:35 PM", minutesLeft: 17, accent: "coral" },
  { id: "2-302", floor: "second", floorLabel: "Second floor", ac: false, occupied: false, currentClass: "Available now", section: "—", nextClass: "Structural Analysis", nextTime: "01:25 PM", minutesLeft: 0, accent: "mint" },
  { id: "2-305", floor: "second", floorLabel: "Second floor", ac: true, occupied: false, currentClass: "Available now", section: "—", nextClass: "Machine Design", nextTime: "02:15 PM", minutesLeft: 0, accent: "mint" },
  { id: "2-307", floor: "second", floorLabel: "Second floor", ac: false, occupied: true, currentClass: "Thermodynamics", section: "ME A", nextClass: "Available", nextTime: "12:35 PM", minutesLeft: 17, accent: "violet" },
  { id: "3-401", floor: "third", floorLabel: "Third floor", ac: true, occupied: false, currentClass: "Available now", section: "—", nextClass: "Digital Logic", nextTime: "03:05 PM", minutesLeft: 0, accent: "mint" },
  { id: "3-402", floor: "third", floorLabel: "Third floor", ac: true, occupied: true, currentClass: "Cyber Security", section: "IT B", nextClass: "Available", nextTime: "12:35 PM", minutesLeft: 17, accent: "coral" },
];

const snapshotSlots = [
  { label: "09:00", percent: 63, tone: "violet" },
  { label: "10:00", percent: 78, tone: "mint" },
  { label: "11:00", percent: 54, tone: "amber" },
  { label: "12:00", percent: 86, tone: "violet" },
  { label: "01:00", percent: 40, tone: "mint" },
];

function isoDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA").format(date);
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en-IN", options).format(parseDate(value));
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

function countClassesBetween(start: Date, end: Date, dailyClasses: number[]) {
  if (end < start) return 0;
  let cursor = new Date(start);
  let total = 0;
  while (cursor <= end) {
    total += dailyClasses[cursor.getDay()] ?? 0;
    cursor = addDays(cursor, 1);
  }
  return total;
}

function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

function safePercent(attended: number, conducted: number) {
  return conducted ? (attended / conducted) * 100 : 0;
}

function requiredToReach(attended: number, conducted: number, target: number) {
  if (safePercent(attended, conducted) >= target * 100) return 0;
  return Math.max(0, Math.ceil((target * conducted - attended) / (1 - target)));
}

function canMissAt(attended: number, conducted: number, target: number) {
  return Math.max(0, Math.floor(attended / target - conducted));
}

function parseLeaveDays(query: string) {
  const match = query.match(/(?:take|of|for|in)?\s*(\d+)\s*[- ]?day/);
  return match ? Number(match[1]) : 0;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}

function answerAdvisor(query: string, selected: Section, calc: ReturnType<typeof buildCalculation>): string {
  const q = normalize(query);
  const days = parseLeaveDays(q);
  const subject = selected.subjects.find((item) => q.includes(normalize(item.name)) || q.includes(normalize(item.code)));
  const wants90 = q.includes("90") || q.includes("ninety");
  const wants75 = q.includes("75") || q.includes("seventy five");
  const asksLowest = q.includes("lowest") || q.includes("most attention") || q.includes("needs the most");
  const asksLeft = q.includes("left") || q.includes("remaining");
  const asksReach = q.includes("reach") || q.includes("get to") || q.includes("required");
  const asksCanMiss = q.includes("miss") || q.includes("leave");
  const isLeaveQuestion = q.includes("leave") || q.includes("sick") || q.includes("medical") || q.includes("absence") || q.includes("od");

  if (subject && isLeaveQuestion) {
    const sessions = Math.min(subject.remaining, Math.max(1, days * 2 || calc.leaveSessions));
    const futureAttended = subject.attended;
    const futureConducted = subject.conducted + sessions;
    const projected = safePercent(futureAttended, futureConducted);
    return `${subject.name} is at ${percent(safePercent(subject.attended, subject.conducted))} today. A ${days || Math.ceil(sessions / 2)}-day leave is modeled as ${sessions} affected classes, so the projected attendance becomes ${percent(projected)}. ${projected < 75 ? "That crosses below the 75% threshold — plan recovery classes before booking it." : "You stay above 75%, but the buffer is worth protecting."}`;
  }

  if (isLeaveQuestion && days) {
    const affected = Math.min(calc.planningClasses, days * selected.dailyClasses.slice(1, 6).reduce((sum, value) => sum + value, 0) / 5);
    const regular = Math.max(0, calc.planningClasses - Math.ceil(affected));
    const projected = safePercent(selected.attended + regular, selected.conducted + regular);
    return `For ${selected.name}, ${days} days is roughly ${Math.ceil(affected)} scheduled classes in this timetable. If those are leave-protected and you attend the rest, your planning projection is ${percent(projected)} — ${projected >= 75 ? "above" : "below"} the 75% line and ${projected >= 90 ? "above" : "below"} the 90% line.`;
  }

  if (asksLowest || subject) {
    const lowest = [...selected.subjects].sort((a, b) => safePercent(a.attended, a.conducted) - safePercent(b.attended, b.conducted))[0];
    return `${lowest.name} is currently your lowest subject at ${percent(safePercent(lowest.attended, lowest.conducted))}. It has ${lowest.remaining} timetable classes left in the current horizon, so it is the best place to protect attendance next.`;
  }

  if (asksReach && (wants90 || q.includes("ninety"))) {
    return `You need ${calc.mustAttend90} consecutive attended classes to reach 90% from ${percent(calc.currentPct)}. With ${calc.planningClasses} classes in the current horizon, ${calc.projectedPct >= 90 ? "the target is achievable if you avoid further misses" : "the target is not reached by the selected planning date"}.`;
  }

  if (asksReach && (wants75 || q.includes("seventy"))) {
    return `You need ${calc.mustAttend75} consecutive attended classes to reach 75%. Your best-case projection for ${formatDate(calc.planningDate)} is ${percent(calc.projectedPct)}.`;
  }

  if (asksCanMiss) {
    return calc.canMiss75 > 0
      ? `You can miss about ${calc.canMiss75} more classes before dropping below 75% at the current baseline. That is a mathematical ceiling, not a recommendation.`
      : `You have no safe misses at the 75% threshold right now. Attend the next ${calc.mustAttend75} classes to rebuild a buffer.`;
  }

  if (asksLeft) {
    return `There are ${calc.planningClasses} scheduled classes for ${selected.name} through ${formatDate(calc.planningDate)}. The timetable model uses ${selected.dailyClasses.slice(1, 6).reduce((sum, value) => sum + value, 0)} classes in a representative week.`;
  }

  if (q.includes("75") || q.includes("90") || q.includes("possible") || q.includes("fall below")) {
    return `Your current attendance is ${percent(calc.currentPct)} and the best-case projection is ${percent(calc.projectedPct)}. 75% is ${calc.projectedPct >= 75 ? "maintained" : "not maintained"}; 90% is ${calc.projectedPct >= 90 ? "maintained" : "not reached"} by ${formatDate(calc.planningDate)}.`;
  }

  return "I can help with attendance, leave planning, required classes, and 75%/90% calculations. Try asking: ‘Can I take 2 days leave?’";
}

function buildCalculation(section: Section, planningDate: string, odDays: number, medicalDays: number, affectedClasses: number) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = parseDate(planningDate);
  const planningClasses = countClassesBetween(addDays(today, 1), endDate, section.dailyClasses);
  const november = new Date(today.getFullYear(), 10, 1);
  const novClasses = countClassesBetween(addDays(today, 1), addDays(november, -1), section.dailyClasses);
  const leaveFromDays = Math.round((odDays + medicalDays) * 4.4);
  const leaveSessions = Math.min(planningClasses, affectedClasses > 0 ? affectedClasses : leaveFromDays);
  const regularFuture = Math.max(0, planningClasses - leaveSessions);
  const currentPct = safePercent(section.attended, section.conducted);
  const projectedAttended = section.attended + regularFuture;
  const projectedConducted = section.conducted + regularFuture;
  const projectedPct = safePercent(projectedAttended, projectedConducted);
  const novMaxPct = safePercent(section.attended + novClasses, section.conducted + novClasses);
  const impossibleBeforeNovember = currentPct < 75 && novMaxPct < 75;
  const req75 = requiredToReach(section.attended, section.conducted, 0.75);
  const req90 = requiredToReach(section.attended, section.conducted, 0.9);
  const health = currentPct >= 90 ? "Excellent" : currentPct >= 75 ? "On track" : currentPct >= 60 ? "At risk" : "Critical";
  return {
    planningDate,
    planningClasses,
    novClasses,
    leaveSessions,
    regularFuture,
    currentPct,
    projectedPct,
    projectedAttended,
    projectedConducted,
    novMaxPct,
    impossibleBeforeNovember,
    mustAttend75: req75,
    mustAttend90: req90,
    canMiss75: canMissAt(section.attended, section.conducted, 0.75),
    canMiss90: canMissAt(section.attended, section.conducted, 0.9),
    maintains90: projectedPct >= 90,
    health,
    odDays,
    medicalDays,
    affectedClasses,
  };
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="icon-button">
      {children}
    </button>
  );
}

function ProgressRing({ value, label, tone = "violet" }: { value: number; label: string; tone?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress-ring progress-ring-${tone}`} style={{ background: `conic-gradient(var(--ring-color) ${safeValue * 3.6}deg, #e9e8ef 0deg)` }}>
      <div className="progress-ring-inner">
        <strong>{Math.round(safeValue)}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function SectionSelect({ selected, onChange }: { selected: Section; onChange: (id: string) => void }) {
  return (
    <label className="section-select">
      <span>Current section</span>
      <span className="select-wrap">
        <select value={selected.id} onChange={(event) => onChange(event.target.value)}>
          {sections.map((section) => <option value={section.id} key={section.id}>{section.name} · {section.batch}</option>)}
        </select>
        <ChevronDown size={16} />
      </span>
    </label>
  );
}

export default function Home() {
  const today = useMemo(() => isoDate(new Date()), []);
  const defaultPlanningDate = useMemo(() => isoDate(addDays(new Date(), 30)), []);
  const [activeNav, setActiveNav] = useState("overview");
  const [selectedId, setSelectedId] = useState("cse-a");
  const [planningDate, setPlanningDate] = useState(defaultPlanningDate);
  const [odDays, setOdDays] = useState(1);
  const [medicalDays, setMedicalDays] = useState(0);
  const [affectedClasses, setAffectedClasses] = useState(6);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roomQuery, setRoomQuery] = useState("");
  const [roomResponse, setRoomResponse] = useState("");
  const [advisorInput, setAdvisorInput] = useState("");
  const [advisorMessages, setAdvisorMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi Alex — I’m your local attendance advisor. Ask me about leave, 75%/90% recovery, or your lowest subject." },
  ]);
  const [roomFilter, setRoomFilter] = useState("all");
  const advisorInputRef = useRef<HTMLInputElement>(null);
  const section = sections.find((item) => item.id === selectedId) ?? sections[0];
  const calc = useMemo(() => buildCalculation(section, planningDate, odDays, medicalDays, affectedClasses), [section, planningDate, odDays, medicalDays, affectedClasses]);
  const lowestSubject = useMemo(() => [...section.subjects].sort((a, b) => safePercent(a.attended, a.conducted) - safePercent(b.attended, b.conducted))[0], [section.subjects]);
  const availableRooms = rooms.filter((room) => !room.occupied).length;
  const visibleRooms = useMemo(() => {
    const q = normalize(roomQuery);
    return rooms.filter((room) => {
      const matchesQuery = !q || normalize(`${room.id} ${room.floorLabel} ${room.currentClass} ${room.nextClass} ${room.section}`).includes(q);
      const matchesFilter = roomFilter === "all" || (roomFilter === "available" && !room.occupied) || (roomFilter === "ac" && room.ac);
      return matchesQuery && matchesFilter;
    });
  }, [roomQuery, roomFilter]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const ids = navItems.map((item) => item.id);
      const current = ids.find((id) => {
        const element = document.getElementById(id);
        return element && element.getBoundingClientRect().top > 80 && element.getBoundingClientRect().top < 340;
      });
      if (current) setActiveNav(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function goTo(id: string) {
    setActiveNav(id);
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function sendAdvisor() {
    const value = advisorInput.trim();
    if (!value) return;
    setAdvisorMessages((messages) => [...messages, { role: "user", text: value }, { role: "assistant", text: answerAdvisor(value, section, calc) }]);
    setAdvisorInput("");
  }

  function searchRooms() {
    const q = normalize(roomQuery);
    const matching = visibleRooms.length;
    if (!q) {
      setRoomResponse(`${availableRooms} of ${rooms.length} rooms are available in the live snapshot. Try “available AC rooms” or “ground floor.”`);
    } else if (matching) {
      setRoomResponse(`I found ${matching} matching room${matching === 1 ? "" : "s"} across the current timetable. Green cards are available now.`);
    } else {
      setRoomResponse("No room matches that phrase yet. Try a floor, room number, “available”, “AC”, or a class name.");
    }
  }

  function resetSimulator() {
    setOdDays(1);
    setMedicalDays(0);
    setAffectedClasses(6);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark"><span>CF</span><div className="brand-spark"><Sparkles size={13} /></div></div>
          <div><div className="brand-name">CampusFlow</div><div className="brand-subtitle">student operations</div></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="workspace-pill"><span className="live-dot" /> Campus · Main campus <ChevronDown size={14} /></div>
        <div className="nav-label">Workspace</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} type="button" onClick={() => goTo(item.id)} className={`nav-item ${activeNav === item.id ? "active" : ""}`}><Icon size={18} /><span>{item.label}</span>{item.id === "advisor" && <span className="nav-badge">NEW</span>}</button>;
          })}
        </nav>
        <div className="sidebar-divider" />
        <div className="nav-label">Quick access</div>
        <button className="quick-link" onClick={() => goTo("attendance")}><CalendarDays size={16} /><span>Planning horizon</span><ArrowUpRight size={14} /></button>
        <button className="quick-link" onClick={() => goTo("rooms")}><Navigation size={16} /><span>Find a quiet room</span><ArrowUpRight size={14} /></button>
        <div className="sidebar-bottom">
          <div className="horizon-card"><div className="horizon-icon"><Clock3 size={17} /></div><div><div className="eyebrow">Planning horizon</div><strong>{formatDate(planningDate, { day: "numeric", month: "short", year: "numeric" })}</strong></div><ArrowRight size={15} /></div>
          <div className="profile-row"><div className="avatar">AR</div><div className="profile-copy"><strong>Alex R.</strong><span>Student workspace</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left"><IconButton label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></IconButton><div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>{navItems.find((item) => item.id === activeNav)?.label}</strong></div></div>
          <div className="topbar-actions"><div className="sync-status"><span className="sync-dot" /> Local engine synced <span className="sync-time">· just now</span></div><IconButton label="Notifications"><Bell size={18} /></IconButton><IconButton label="Toggle theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</IconButton><div className="top-avatar">AR</div></div>
        </header>

        <div className="page-wrap">
          <section className="hero-section" id="overview">
            <div className="hero-copy"><div className="eyebrow accent-eyebrow"><span className="status-pulse" /> Today · {todayLabel()}</div><h1>Make room for <em>what matters.</em></h1><p>One calm view for your attendance buffer, the next available room, and decisions that keep your semester moving.</p><div className="hero-actions"><button className="primary-button" onClick={() => goTo("attendance")}>Plan my attendance <ArrowRight size={17} /></button><button className="text-button" onClick={() => goTo("rooms")}>Explore rooms <ArrowUpRight size={16} /></button></div></div>
            <div className="hero-visual" aria-label="CampusFlow planning preview"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-note note-top"><div className="mini-icon mint-icon"><Check size={13} /></div><div><span>Attendance health</span><strong>{calc.health}</strong></div></div><div className="hero-center-card"><div className="hero-center-top"><span>Current buffer</span><span className="mini-live">LIVE</span></div><div className="hero-score">{Math.round(calc.currentPct)}<small>%</small></div><div className="hero-score-label">{section.name} · overall</div><div className="hero-mini-bars"><span style={{ height: "42%" }} /><span style={{ height: "61%" }} /><span style={{ height: "53%" }} /><span style={{ height: "84%" }} /><span style={{ height: "67%" }} /><span style={{ height: "76%" }} /></div></div><div className="hero-note note-bottom"><div className="mini-icon violet-icon"><DoorOpen size={13} /></div><div><span>Rooms open now</span><strong>{availableRooms} <small>/ {rooms.length}</small></strong></div></div></div>
          </section>

          <section className="stats-grid" aria-label="Attendance overview">
            <div className="stat-card stat-primary"><div className="stat-top"><span className="stat-label">Overall attendance</span><span className="stat-icon"><Gauge size={17} /></span></div><div className="stat-value">{percent(calc.currentPct)}</div><div className="stat-foot"><span className="positive"><TrendingUp size={14} /> +2.4%</span><span>vs. last check-in</span></div><div className="stat-spark"><span /><span /><span /><span /><span /><span /><span /></div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-label">Classes in horizon</span><span className="stat-icon soft-orange"><CalendarDays size={17} /></span></div><div className="stat-value">{calc.planningClasses}</div><div className="stat-foot"><span>through {formatDate(planningDate)}</span><ArrowUpRight size={14} /></div><div className="stat-progress"><span style={{ width: `${Math.min(100, (calc.planningClasses / 150) * 100)}%` }} /></div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-label">To reach 90%</span><span className="stat-icon soft-violet"><TargetIcon /></span></div><div className="stat-value">{calc.mustAttend90}<small> classes</small></div><div className="stat-foot"><span>consecutive attendance</span><span className="neutral-dot" /></div><div className="stat-progress violet-progress"><span style={{ width: `${Math.min(100, (calc.currentPct / 90) * 100)}%` }} /></div></div>
            <div className={`stat-card ${calc.health === "Critical" ? "stat-alert" : ""}`}><div className="stat-top"><span className="stat-label">Health indicator</span><span className={`health-dot ${calc.health.toLowerCase().replace(" ", "-")}`} /></div><div className="stat-value stat-health">{calc.health}</div><div className="stat-foot"><span>{lowestSubject.name} needs attention</span><ArrowUpRight size={14} /></div><div className="health-track"><span style={{ width: `${Math.min(100, calc.currentPct)}%` }} /></div></div>
          </section>

          <section className="overview-grid">
            <div className="panel attendance-snapshot"><div className="panel-heading"><div><div className="eyebrow">The big picture</div><h2>Attendance snapshot</h2></div><button className="ghost-button" onClick={() => goTo("attendance")}>View details <ArrowUpRight size={15} /></button></div><div className="snapshot-body"><div className="ring-wrap"><ProgressRing value={calc.currentPct} label="current" /><div className="ring-caption"><span className="legend-dot violet-dot" /> Attended <strong>{section.attended}</strong></div><div className="ring-caption"><span className="legend-dot gray-dot" /> Missed <strong>{section.conducted - section.attended}</strong></div></div><div className="snapshot-copy"><div className="metric-callout"><span>Best-case projection</span><strong>{percent(calc.projectedPct)}</strong><small>if you attend all regular classes</small></div><div className="threshold-list"><div className="threshold-row"><span>75% safe line</span><div className="threshold-track"><span style={{ width: `${Math.min(100, calc.currentPct / 0.75)}%` }} /></div><strong className={calc.currentPct >= 75 ? "green-text" : "amber-text"}>{calc.currentPct >= 75 ? "safe" : `${calc.mustAttend75} to go`}</strong></div><div className="threshold-row"><span>90% target</span><div className="threshold-track violet-track"><span style={{ width: `${Math.min(100, calc.currentPct / 0.9)}%` }} /></div><strong>{calc.mustAttend90} to go</strong></div></div><div className="snapshot-foot"><span><span className="tiny-check"><Check size={11} /></span> Calculated locally</span><span>{section.name} · {section.tutor}</span></div></div></div></div>
            <div className="panel focus-panel"><div className="panel-heading"><div><div className="eyebrow">Next best action</div><h2>Protect your buffer</h2></div><span className="icon-bubble"><HeartPulse size={18} /></span></div><div className="focus-score"><div className="focus-score-main">{percent(safePercent(lowestSubject.attended, lowestSubject.conducted))}</div><span>lowest subject</span></div><div className="focus-subject"><div className="subject-avatar" style={{ background: lowestSubject.color }}>{lowestSubject.name.slice(0, 2).toUpperCase()}</div><div><strong>{lowestSubject.name}</strong><span>{lowestSubject.code} · {lowestSubject.remaining} classes left</span></div><ArrowRight size={16} /></div><div className="focus-tip"><Sparkles size={15} /><p>Attend the next <strong>{Math.min(5, lowestSubject.remaining)} {lowestSubject.name}</strong> classes to create breathing room before your next leave request.</p></div><button className="outline-button full-width" onClick={() => { setAdvisorInput(`Which subject needs the most attention?`); goTo("advisor"); setTimeout(() => advisorInputRef.current?.focus(), 350); }}>Ask the advisor <MessageCircle size={16} /></button></div>
          </section>

          <section className="section-block" id="attendance"><div className="section-header"><div><div className="eyebrow accent-eyebrow"><span className="section-index">01</span> Attendance lab</div><h2>Plan the semester, not just the next class.</h2><p>Adjust your section, horizon, and leave assumptions. Every number below is recalculated from the timetable model in your browser.</p></div><SectionSelect selected={section} onChange={setSelectedId} /></div>
            <div className="attendance-lab-grid"><div className="panel controls-panel"><div className="panel-heading"><div><div className="eyebrow">Planning inputs</div><h3>Set your assumptions</h3></div><span className="local-badge"><ShieldCheck size={14} /> local only</span></div><div className="form-grid"><label className="field"><span>Today</span><div className="input-with-icon"><CalendarDays size={16} /><input type="date" value={today} readOnly /></div></label><label className="field"><span>Planning date</span><div className="input-with-icon"><CalendarDays size={16} /><input type="date" min={today} value={planningDate} onChange={(event) => setPlanningDate(event.target.value)} /></div></label><label className="field"><span>Classes attended</span><input type="number" min={0} value={section.attended} onChange={() => undefined} readOnly /></label><label className="field"><span>Classes conducted</span><input type="number" min={1} value={section.conducted} onChange={() => undefined} readOnly /></label></div><div className="input-note"><Info size={14} /><span>Attendance baseline comes from the selected section. Switch sections above to compare the full batch.</span></div><div className="calculation-line"><div><span>Current percentage</span><strong>{percent(calc.currentPct)}</strong></div><ArrowRight size={18} /><div><span>Best-case projection</span><strong className={calc.projectedPct >= 75 ? "green-text" : "amber-text"}>{percent(calc.projectedPct)}</strong></div></div></div>
              <div className={`panel detention-panel ${calc.impossibleBeforeNovember ? "is-warning" : "is-safe"}`}><div className="detention-top"><div className={`detention-icon ${calc.impossibleBeforeNovember ? "warning-icon" : "safe-icon"}`}>{calc.impossibleBeforeNovember ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}</div><div><div className="eyebrow">Before November checkpoint</div><h3>{calc.impossibleBeforeNovember ? "⚠️ IRREVERSIBLE DETENTION" : "Recovery window is open"}</h3></div></div><p>{calc.impossibleBeforeNovember ? `Even with perfect attendance for all ${calc.novClasses} scheduled classes before 1 November, ${section.name} reaches only ${percent(calc.novMaxPct)}. The 75% threshold cannot be recovered mathematically in this window.` : `If you attend every class before 1 November, ${section.name} can reach ${percent(calc.novMaxPct)}. Keep the current buffer protected.`}</p><div className="detention-math"><div><span>Max by 01 Nov</span><strong>{percent(calc.novMaxPct)}</strong></div><div><span>Classes left</span><strong>{calc.novClasses}</strong></div><div><span>75% threshold</span><strong>75%</strong></div></div><div className="detention-foot"><span><ShieldCheck size={14} /> Transparent calculation</span><span>{calc.impossibleBeforeNovember ? "No hard-coded warning" : "Recalculated live"}</span></div></div>
            </div>
            <div className="lab-metrics"><div className="metric-card"><div className="metric-icon blue-metric"><CalendarDays size={17} /></div><div><span>Total classes remaining</span><strong>{calc.planningClasses}</strong><small>in selected horizon</small></div></div><div className="metric-card"><div className="metric-icon orange-metric"><CheckCircle2 size={17} /></div><div><span>Must attend for 75%</span><strong>{calc.mustAttend75}</strong><small>consecutive classes</small></div></div><div className="metric-card"><div className="metric-icon violet-metric"><TrendingUp size={17} /></div><div><span>Can safely miss</span><strong>{calc.canMiss75}</strong><small>at current baseline</small></div></div><div className="metric-card"><div className="metric-icon green-metric"><ShieldCheck size={17} /></div><div><span>Above 90% possible?</span><strong>{calc.maintains90 ? "Yes" : "Not yet"}</strong><small>{calc.maintains90 ? "with this plan" : `${calc.mustAttend90} classes needed`}</small></div></div></div>
            <div className="visualization-grid"><div className="panel subject-panel"><div className="panel-heading"><div><div className="eyebrow">Subject pulse</div><h3>Where your buffer lives</h3></div><span className="muted-chip">5 subjects</span></div><div className="subject-list">{section.subjects.map((subject) => { const subjectPct = safePercent(subject.attended, subject.conducted); return <div className="subject-row" key={subject.code}><div className="subject-row-top"><div className="subject-label"><span className="subject-dot" style={{ background: subject.color }} /><strong>{subject.name}</strong><span>{subject.code}</span></div><strong>{percent(subjectPct)}</strong></div><div className="subject-progress"><span style={{ width: `${subjectPct}%`, background: subject.color }} /></div><div className="subject-row-foot"><span>{subject.attended}/{subject.conducted} attended</span><span>{subject.remaining} classes remaining</span></div></div>; })}</div></div><div className="panel chart-panel"><div className="panel-heading"><div><div className="eyebrow">Attendance mix</div><h3>Attended vs. missed</h3></div><BarChart3 size={19} className="muted-icon" /></div><div className="mix-chart"><div className="mix-donut" style={{ background: `conic-gradient(#5B5FEF ${calc.currentPct * 3.6}deg, #e7e6ef 0deg)` }}><div><strong>{Math.round(calc.currentPct)}%</strong><span>attended</span></div></div><div className="mix-legend"><div><span className="legend-dot violet-dot" /><span>Attended</span><strong>{section.attended}</strong></div><div><span className="legend-dot gray-dot" /><span>Missed</span><strong>{section.conducted - section.attended}</strong></div><div><span className="legend-dot mint-dot" /><span>Projected</span><strong>{Math.round(calc.projectedPct)}%</strong></div></div></div><div className="threshold-chart"><div className="threshold-bar-row"><span>Current</span><div><span style={{ width: `${calc.currentPct}%` }} /></div><strong>{Math.round(calc.currentPct)}%</strong></div><div className="threshold-bar-row"><span>75%</span><div className="bar-soft"><span style={{ width: "75%" }} /></div><strong>75%</strong></div><div className="threshold-bar-row"><span>90%</span><div className="bar-soft violet-bar"><span style={{ width: "90%" }} /></div><strong>90%</strong></div></div></div></div>
            <div className="panel leave-panel"><div className="leave-copy"><div className="eyebrow">Scenario simulator</div><h3>OD & medical leave, made transparent.</h3><p>Leave-protected classes are removed from the projected denominator. Regular absence still counts as a miss. Use the sliders to model a real request before you make it.</p><div className="leave-key"><span><span className="key-box regular-key" /> Regular classes</span><span><span className="key-box od-key" /> OD</span><span><span className="key-box medical-key" /> Medical</span></div></div><div className="leave-inputs"><label className="field"><span><span className="field-dot od-dot" /> OD days</span><div className="stepper"><button onClick={() => setOdDays(Math.max(0, odDays - 1))} aria-label="Decrease OD days">−</button><input type="number" min={0} value={odDays} onChange={(event) => setOdDays(Math.max(0, Number(event.target.value)))} /><button onClick={() => setOdDays(odDays + 1)} aria-label="Increase OD days">+</button></div></label><label className="field"><span><span className="field-dot medical-dot" /> Medical leave days</span><div className="stepper"><button onClick={() => setMedicalDays(Math.max(0, medicalDays - 1))} aria-label="Decrease medical leave days">−</button><input type="number" min={0} value={medicalDays} onChange={(event) => setMedicalDays(Math.max(0, Number(event.target.value)))} /><button onClick={() => setMedicalDays(medicalDays + 1)} aria-label="Increase medical leave days">+</button></div></label><label className="field"><span>Classes affected</span><input type="number" min={0} value={affectedClasses} onChange={(event) => setAffectedClasses(Math.max(0, Number(event.target.value)))} /></label><button className="reset-button" onClick={resetSimulator}><RotateCcw size={15} /> Reset</button></div><div className="leave-result"><div><span>Projected attendance</span><strong className={calc.projectedPct >= 75 ? "green-text" : "amber-text"}>{percent(calc.projectedPct)}</strong><small>{calc.leaveSessions} leave-protected · {calc.regularFuture} regular attended</small></div><div><span>75% maintained</span><strong>{calc.projectedPct >= 75 ? "Yes" : "No"}</strong><small>{calc.mustAttend75} recovery classes needed</small></div><div><span>90% maintained</span><strong>{calc.projectedPct >= 90 ? "Yes" : "No"}</strong><small>{calc.mustAttend90} total recovery classes</small></div></div></div>
          </section>

          <section className="section-block rooms-section" id="rooms"><div className="section-header"><div><div className="eyebrow accent-eyebrow"><span className="section-index">02</span> Smart room finder</div><h2>Find a place that fits the next hour.</h2><p>Ask in plain language. The local room index matches floor, availability, AC, room number, and class context.</p></div><div className="room-live-pill"><span className="live-dot" /> Snapshot live · 11:18 AM</div></div><div className="room-search-panel"><div className="search-lead"><div className="search-icon"><Search size={21} /></div><div><strong>Where should I work?</strong><span>Try “available AC rooms on the first floor”</span></div></div><div className="room-search-row"><input value={roomQuery} onChange={(event) => setRoomQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") searchRooms(); }} placeholder="Ask for a room, floor, or class…" aria-label="Search for rooms" /><button className="primary-button" onClick={searchRooms}>Search rooms <ArrowRight size={16} /></button></div>{roomResponse && <div className="room-response"><Sparkles size={15} /><span>{roomResponse}</span><button onClick={() => setRoomResponse("")} aria-label="Dismiss room response"><X size={14} /></button></div>}</div><div className="room-toolbar"><div className="filter-tabs"><button className={roomFilter === "all" ? "selected" : ""} onClick={() => setRoomFilter("all")}>All rooms <span>{rooms.length}</span></button><button className={roomFilter === "available" ? "selected" : ""} onClick={() => setRoomFilter("available")}>Available <span>{availableRooms}</span></button><button className={roomFilter === "ac" ? "selected" : ""} onClick={() => setRoomFilter("ac")}>AC enabled <span>{rooms.filter((room) => room.ac).length}</span></button></div><span className="result-count">Showing {visibleRooms.length} rooms <Filter size={14} /></span></div><div className="floor-groups">{["ground", "first", "second", "third"].map((floor) => { const floorRooms = visibleRooms.filter((room) => room.floor === floor); if (!floorRooms.length) return null; const label = floorRooms[0].floorLabel; return <div className="floor-group" key={floor}><div className="floor-title"><div className="floor-marker"><MapPin size={15} /></div><div><h3>{label}</h3><span>{floorRooms.length} rooms in this view</span></div><div className="floor-line" /></div><div className="room-grid">{floorRooms.map((room) => <div className={`room-card ${room.occupied ? "occupied" : "available"}`} key={room.id}><div className="room-card-top"><div className="room-number"><span className="room-status-dot" />{room.id}</div><div className="room-actions"><span className={`status-chip ${room.occupied ? "occupied-chip" : "available-chip"}`}>{room.occupied ? "Occupied" : "Available"}</span><MoreHorizontal size={16} /></div></div><div className="room-title-row"><h4>{room.occupied ? room.currentClass : "Open for your next block"}</h4>{room.ac ? <span className="ac-pill"><Snowflake size={12} /> AC</span> : <span className="ac-pill non-ac"><Wind size={12} /> Non-AC</span>}</div><div className="room-meta"><span><Users size={13} /> {room.section}</span><span><Clock3 size={13} /> {room.occupied ? `${room.minutesLeft} min left` : "Open now"}</span></div><div className="room-next"><span>Next class</span><strong>{room.nextClass}</strong><span>{room.nextTime}</span></div></div>)}</div></div>; })}</div></section>

          <section className="section-block advisor-section" id="advisor"><div className="section-header"><div><div className="eyebrow accent-eyebrow"><span className="section-index">03</span> Local attendance advisor</div><h2>Ask the question before it becomes a problem.</h2><p>No cloud AI, no API key, no data leaving this browser. The advisor uses keyword detection, regex, and the live dashboard calculations above.</p></div><div className="local-engine-badge"><Sparkles size={15} /> Rule-based local engine</div></div><div className="advisor-layout"><div className="panel advisor-panel"><div className="advisor-header"><div className="advisor-avatar"><Sparkles size={18} /></div><div><strong>Attendance Advisor</strong><span>Reads your current {section.name} dashboard data</span></div><span className="online-pill"><span /> online</span></div><div className="chat-window">{advisorMessages.map((message, index) => <div className={`chat-row ${message.role}`} key={`${message.role}-${index}`}><div className={`chat-avatar ${message.role}`}>{message.role === "assistant" ? <Sparkles size={14} /> : "AR"}</div><div className="chat-bubble">{message.text}</div></div>)}</div><div className="suggestion-row"><button onClick={() => setAdvisorInput("Can I take 2 days leave?")}>Can I take 2 days leave?</button><button onClick={() => setAdvisorInput("What is my lowest attendance?")}>What is my lowest attendance?</button><button onClick={() => setAdvisorInput("How many classes do I need for 90%?")}>Need 90%?</button></div><div className="advisor-input"><input ref={advisorInputRef} value={advisorInput} onChange={(event) => setAdvisorInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendAdvisor(); }} placeholder="Ask about your attendance…" /><button onClick={sendAdvisor} aria-label="Send question"><Send size={17} /></button></div><div className="advisor-disclaimer"><ShieldCheck size={13} /> Local calculation · Based on {section.name} · No external AI API</div></div><div className="panel advisor-side-panel"><div className="panel-heading"><div><div className="eyebrow">What it understands</div><h3>Try a natural question</h3></div><CircleHelp size={19} className="muted-icon" /></div><div className="intent-list"><div><span className="intent-icon leave-intent"><CalendarDays size={15} /></span><div><strong>Leave planning</strong><p>“Will 3 days sick leave drop Chemistry below 75%?”</p></div></div><div><span className="intent-icon recovery-intent"><TrendingUp size={15} /></span><div><strong>Recovery math</strong><p>“How many classes do I need for 90%?”</p></div></div><div><span className="intent-icon focus-intent"><HeartPulse size={15} /></span><div><strong>Subject focus</strong><p>“Which subject needs the most attention?”</p></div></div><div><span className="intent-icon room-intent"><DoorOpen size={15} /></span><div><strong>Quick context</strong><p>Ask “how many classes are left?”</p></div></div></div><div className="advisor-footnote"><Info size={14} /><span>Responses are rule-based and explain the inputs used instead of pretending to be a cloud model.</span></div></div></div></section>

          <footer className="site-footer"><div className="footer-brand"><div className="brand-mark small-mark"><span>CF</span></div><div><strong>CampusFlow</strong><span>Smart systems for student life.</span></div></div><div className="footer-note"><ShieldCheck size={15} /> All calculations run locally in your browser.</div><span className="footer-version">v1.0 · local-first</span></footer>
        </div>
      </main>
      <button className="floating-advisor" onClick={() => { goTo("advisor"); setTimeout(() => advisorInputRef.current?.focus(), 350); }}><span className="floating-icon"><MessageCircle size={19} /></span><span><strong>Attendance Advisor</strong><small>Ask a question</small></span><ArrowUpRight size={15} /></button>
    </div>
  );
}

function TargetIcon() {
  return <span className="target-icon"><span /></span>;
}

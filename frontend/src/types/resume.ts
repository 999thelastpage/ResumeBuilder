export interface ResumeData {
  bio: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  links: {
    label: string;
    url: string;
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    location: string;
    bullets: string[];
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
}

export const defaultResumeData: ResumeData = {
  bio: {
    name: "Jordan Mitchell",
    title: "Senior Software Engineer",
    email: "jordan.mitchell@email.com",
    phone: "+1 415 892 3041",
    location: "San Francisco, CA",
    summary: "Results-driven software engineer with 7+ years of experience building scalable web applications and distributed systems. Passionate about clean architecture, developer tooling, and mentoring junior engineers. Led migration of monolithic services to microservices, reducing deployment time by 60%."
  },
  links: [
    { label: "GitHub", url: "https://github.com/jordanm" },
    { label: "LinkedIn", url: "https://linkedin.com/in/jordanmitchell" },
    { label: "Portfolio", url: "https://jordanmitchell.dev" }
  ],
  experience: [
    {
      id: "exp1",
      company: "Stripe",
      role: "Senior Software Engineer",
      startDate: "Mar 2022",
      endDate: "Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected and delivered a real-time fraud detection pipeline processing 50K+ events/sec using Kafka and Flink.",
        "Led a cross-functional team of 5 engineers to redesign the merchant onboarding flow, reducing drop-off by 34%.",
        "Established CI/CD best practices and reduced average deployment cycle from 45 min to 12 min.",
        "Mentored 3 junior engineers through quarterly growth plans and weekly 1:1 code reviews."
      ]
    },
    {
      id: "exp2",
      company: "Airbnb",
      role: "Software Engineer II",
      startDate: "Jun 2019",
      endDate: "Feb 2022",
      location: "San Francisco, CA",
      bullets: [
        "Built and maintained the Payments Reconciliation Service handling $2B+ in annual transactions.",
        "Developed a custom React component library used across 12 internal tools, improving dev velocity by 25%.",
        "Implemented comprehensive integration test suite that caught 40% more regressions before production."
      ]
    },
    {
      id: "exp3",
      company: "Figma",
      role: "Frontend Engineer",
      startDate: "Aug 2017",
      endDate: "May 2019",
      location: "San Francisco, CA",
      bullets: [
        "Contributed to the real-time multiplayer editing engine, optimizing WebSocket communication latency by 30%.",
        "Shipped the plugin API v2, enabling 500+ community-built extensions within the first quarter."
      ]
    }
  ],
  education: [
    {
      id: "edu1",
      institution: "UC Berkeley",
      degree: "B.S. Computer Science",
      startDate: "2013",
      endDate: "2017"
    }
  ],
  skills: [
    { category: "Languages", items: ["TypeScript", "Python", "Go", "Java", "SQL"] },
    { category: "Frontend", items: ["React", "Next.js", "Vue.js", "CSS-in-JS"] },
    { category: "Backend & Infra", items: ["Node.js", "FastAPI", "PostgreSQL", "Redis", "Kafka", "AWS"] },
    { category: "Tools", items: ["Git", "Docker", "Kubernetes", "Terraform", "Datadog"] }
  ]
};

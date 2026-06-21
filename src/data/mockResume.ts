import { ResumeData } from "../types";

export const mockResumeData: ResumeData = {
  personalInfo: {
    name: "Alex Mercer",
    title: "Senior Full-Stack Software Engineer",
    email: "alex.mercer@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://linkedin.com/in/alex-mercer",
  },
  summary: "Adaptive and results-driven Senior Engineer with 6+ years of experience spearheading full-stack web applications. Expert in TypeScript, React, Node.js, and cloud native architectures. Proven history of optimizing web performance by up to 40% and leading agile development squads.",
  experience: [
    {
      id: "exp-1",
      jobTitle: "Senior Software Engineer",
      company: "Velocity Tech Solutions",
      location: "San Francisco, CA",
      startDate: "2023-01",
      endDate: "Present",
      current: true,
      description: [
        "Architected and deployed a highly scalable analytics dashboard serving 150K+ daily active users, improving response latency by 35% with Redis caching.",
        "Pioneered migration from a legacy monolithic architecture to TypeScript microservices using Docker and Kuberenetes.",
        "Mentored team of 6 junior and mid-level web developers, standardizing code review checklists and reducing bug spillover by 18%."
      ]
    },
    {
      id: "exp-2",
      jobTitle: "Software Engineer II",
      company: "Innovate Financial Corp",
      location: "Boston, MA",
      startDate: "2020-06",
      endDate: "2022-12",
      current: false,
      description: [
        "Collaborated with UX/UI designers to redesign core billing portal, resulting in a 25% increase in online payment completions.",
        "Authored clean, modular, and unit-tested RESTful APIs in Express and PostgreSQL handling 2.5M transactions daily.",
        "Integrated third-party payment gateways (Stripe, PayPal) ensuring high-security standard API compliant integrations."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      school: "Boston University",
      location: "Boston, MA",
      graduationDate: "2020-05",
      description: "Graduated Magna Cum Laude. Special emphasis on Distributed Systems, Relational Databases, and Software Engineering."
    }
  ],
  skills: [
    "TypeScript", "JavaScript (ES6+)", "React", "Next.js", "Node.js", "Express", 
    "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "REST APIs", "GraphQL", 
    "AWS (S3, EC2, Lambda)", "Git / CI-CD", "Unit Testing (Jest, Vitest)", "Agile / Scrum"
  ],
  projects: [
    {
      id: "proj-1",
      title: "Clarity task management",
      role: "Lead Creator",
      technologies: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Socket.io"],
      link: "https://github.com/alexmercer/clarity-task",
      description: [
        "Designed a real-time collaborative workspace canvas utilizing web socket channels for concurrent task tracking updates.",
        "Implemented drag-and-drop workflow status boards using React Beautiful DND, scaling smoothly across tablet and desktop viewpoints."
      ]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2024-03"
    },
    {
      id: "cert-2",
      name: "Certified ScrumMaster (CSM)",
      issuer: "Scrum Alliance",
      date: "2022-09"
    }
  ]
};

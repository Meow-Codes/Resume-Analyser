// backend/utils/skillData.js
const skillData = {
    // Web Development
    "JavaScript": ["JS", "Javascript", "ES6", "ECMAScript"],
    "HTML": ["HTML5", "HyperText Markup Language"],
    "CSS": ["CSS3", "Cascading Style Sheets"],
    "React": ["React.js", "ReactJS", "React JS"],
    "Node.js": ["Node", "NodeJS", "Node JS"],
    "Angular JS": ["Angular", "AngularJS", "Angular.js"],
    "Express JS": ["Express", "Express.js", "ExpressJS"],
    "Vue.js": ["Vue", "VueJS", "Vue JS"],
    "TypeScript": ["TS"],
    "jQuery": [],
    "Bootstrap": ["Bootstrap CSS"],
    "SASS": ["Sass", "SCSS"],
    "REST APIs": ["REST", "Restful APIs", "RESTful"],
    "GraphQL": [],
    "WebSocket": ["Websockets"],
  
    // Backend Development
    "Python": ["Py"],
    "Java": ["Java SE", "Java EE"],
    "C#": ["C Sharp"],
    "Ruby": ["Ruby on Rails", "RoR"],
    "PHP": [],
    "Go": ["Golang"],
    "Django": [],
    "Flask": [],
    "Spring": ["Spring Boot"],
    "ASP.NET": [".NET", "DotNET"],
    "SQL": ["Structured Query Language"],
    "MongoDB": ["Mongo", "Mongodb"],
    "PostgreSQL": ["Postgres", "Postgre"],
    "MySQL": [],
    "Redis": [],
  
    // Cloud Computing
    "AWS": ["Amazon Web Services"],
    "Azure": ["Microsoft Azure"],
    "GCP": ["Google Cloud Platform", "Google Cloud"],
    "Docker": [],
    "Kubernetes": ["K8s"],
    "Terraform": [],
    "Ansible": [],
    "Jenkins": [],
    "CI/CD": ["Continuous Integration", "Continuous Deployment"],
    "Serverless": ["Serverless Computing"],
  
    // Machine Learning / AI / Data Science
    "Machine Learning": ["ML"],
    "Deep Learning": ["DL"],
    "Artificial Intelligence": ["AI"],
    "Data Science": ["DS"],
    "TensorFlow": ["TF"],
    "PyTorch": [],
    "Keras": [],
    "Scikit-learn": ["Sklearn"],
    "Pandas": [],
    "NumPy": ["Numpy"],
    "R": ["R Language"],
    "Natural Language Processing": ["NLP"],
    "Computer Vision": ["CV"],
    "Big Data": [],
    "Hadoop": [],
    "Spark": ["Apache Spark"],
  
    // IoT (Internet of Things)
    "IoT": ["Internet of Things"],
    "Arduino": [],
    "Raspberry Pi": ["RPi"],
    "MQTT": [],
    "Embedded Systems": ["Embedded"],
    "C": [],
    "C++": ["CPP"],
  
    // Robotics
    "Robotics": [],
    "ROS": ["Robot Operating System"],
    "MATLAB": [],
    "Control Systems": [],
    "PLC": ["Programmable Logic Controller"],
  
    // Web3 / Blockchain
    "Blockchain": [],
    "Web3": ["Web 3.0"],
    "Ethereum": [],
    "Solidity": [],
    "Smart Contracts": [],
    "Truffle": [],
    "Hyperledger": [],
    "Cryptography": ["Crypto"],
    "Decentralized Apps": ["DApps", "dApps"],
  
    // Quantum Computing
    "Quantum Computing": [],
    "Qiskit": [],
    "Cirq": [],
    "Quantum Mechanics": [],
  
    // DevOps / Infrastructure
    "Linux": ["Unix"],
    "Bash": ["Shell Scripting"],
    "Git": [],
    "GitHub": [],
    "GitLab": [],
    "Nginx": [],
    "Apache": ["Apache Server"],
  
    // General Software Engineering
    "Agile": ["Scrum", "Scrum/Agile", "Agile Methodology"],
    "TDD": ["Test-Driven Development"],
    "OOP": ["Object-Oriented Programming"],
    "Design Patterns": [],
    "Microservices": [],
    "API Development": ["APIs"],
  
    // Cybersecurity
    "Cybersecurity": ["Cyber Security"],
    "Penetration Testing": ["Pen Testing"],
    "Ethical Hacking": [],
    "Wireshark": [],
    "Kali Linux": [],
  };
  
  // Generate skillset from skillData keys
  const skillset = new Set(Object.keys(skillData));
  
  // Pre-normalize aliases for faster lookup
  const normalizedSkillMap = new Map();
  for (const [skill, aliases] of Object.entries(skillData)) {
    const normalizedSkill = skill.toLowerCase().replace(/[-_\s]/g, "");
    normalizedSkillMap.set(normalizedSkill, skill);
    aliases.forEach((alias) => {
      const normalizedAlias = alias.toLowerCase().replace(/[-_\s]/g, "");
      normalizedSkillMap.set(normalizedAlias, skill);
    });
  }
  
  module.exports = { skillData, skillset, normalizedSkillMap };
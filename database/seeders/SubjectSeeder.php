<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            // ==========================================
            // GENERAL EDUCATION CURRICULUM (GEC)
            // CHED CMO No. 20 s. 2013
            // ==========================================
            [
                'code' => 'GEC 101',
                'title' => 'Understanding the Self',
                'units' => 3.0,
                'description' => 'Explores the nature of identity and the self through philosophical, sociological, and psychological perspectives.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 102',
                'title' => 'Readings in Philippine History',
                'units' => 3.0,
                'description' => 'Critical readings of primary sources from Philippine history, analyzing economic, social, cultural, and political dimensions.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 103',
                'title' => 'The Contemporary World',
                'units' => 3.0,
                'description' => 'Introduction to globalization, global politics, global economics, global culture, and global governance.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 104',
                'title' => 'Mathematics in the Modern World',
                'units' => 3.0,
                'description' => 'Mathematics as a tool for critical thinking, problem solving, and decision-making in the modern world.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 105',
                'title' => 'Purposive Communication',
                'units' => 3.0,
                'description' => 'Effective communication across various academic and professional contexts, focusing on writing and oral communication.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 106',
                'title' => 'Art Appreciation',
                'units' => 3.0,
                'description' => 'Introduction to the nature of art, its role in human experience and society, and critical appreciation of visual arts, music, and literature.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 107',
                'title' => 'Science, Technology and Society',
                'units' => 3.0,
                'description' => 'Relationship between science, technology, and societal change, examining ethical, environmental, and sociocultural implications.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 108',
                'title' => 'Ethics',
                'units' => 3.0,
                'description' => 'Moral philosophy and ethical theories applied to contemporary issues and professional contexts.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 109',
                'title' => 'Life and Works of Rizal',
                'units' => 3.0,
                'description' => 'Life, works, and writings of Jose Rizal as required by RA 1425, emphasizing his contributions to Philippine nationalism.',
                'is_active' => true,
            ],

            // ==========================================
            // PHYSICAL EDUCATION (PATHFIT)
            // ==========================================
            [
                'code' => 'PATHFIT 1',
                'title' => 'Physical Activities Towards Health and Fitness 1',
                'units' => 2.0,
                'description' => 'Movement competency training and physical activity promotion for overall wellness.',
                'is_active' => true,
            ],
            [
                'code' => 'PATHFIT 2',
                'title' => 'Physical Activities Towards Health and Fitness 2',
                'units' => 2.0,
                'description' => 'Exercise-based fitness activities for health enhancement and lifestyle improvement.',
                'is_active' => true,
            ],
            [
                'code' => 'PATHFIT 3',
                'title' => 'Physical Activities Towards Health and Fitness 3',
                'units' => 2.0,
                'description' => 'Sports and recreational activities for physical development, teamwork, and sportsmanship.',
                'is_active' => true,
            ],
            [
                'code' => 'PATHFIT 4',
                'title' => 'Physical Activities Towards Health and Fitness 4',
                'units' => 2.0,
                'description' => 'Advanced physical activities, fitness testing, and personal wellness planning.',
                'is_active' => true,
            ],

            // ==========================================
            // NATIONAL SERVICE TRAINING PROGRAM (NSTP)
            // ==========================================
            [
                'code' => 'NSTP 101',
                'title' => 'National Service Training Program 1',
                'units' => 3.0,
                'description' => 'First component of NSTP (ROTC, CWTS, or LTS) promoting civic consciousness and defense preparedness among youth.',
                'is_active' => true,
            ],
            [
                'code' => 'NSTP 102',
                'title' => 'National Service Training Program 2',
                'units' => 3.0,
                'description' => 'Continuation of NSTP, deepening civic engagement and community service skills.',
                'is_active' => true,
            ],

            // ==========================================
            // FILIPINO SUBJECTS
            // ==========================================
            [
                'code' => 'FIL 101',
                'title' => 'Komunikasyon sa Akademikong Filipino',
                'units' => 3.0,
                'description' => 'Paggamit ng Filipino sa iba\'t ibang situwasyon ng akademikong komunikasyon.',
                'is_active' => true,
            ],
            [
                'code' => 'FIL 102',
                'title' => 'Pagbasa at Pagsulat sa Filipino',
                'units' => 3.0,
                'description' => 'Pagpapaunlad ng kasanayang magbasa at magsulat ng iba\'t ibang uri ng teksto sa Filipino.',
                'is_active' => true,
            ],

            // ==========================================
            // COMMON COMPUTING SUBJECTS (COSC)
            // Shared between BSCS and BSIT programs
            // CHED CMO No. 25 s. 2015
            // ==========================================
            [
                'code' => 'COSC 101',
                'title' => 'Introduction to Computing',
                'units' => 3.0,
                'description' => 'Overview of computer hardware, software, and fundamental concepts in computing including basic programming logic.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 102',
                'title' => 'Computer Programming 1',
                'units' => 3.0,
                'description' => 'Fundamentals of programming using a structured programming language; problem solving, algorithms, and program design.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 103',
                'title' => 'Computer Programming 2',
                'units' => 3.0,
                'description' => 'Advanced programming concepts including arrays, functions, file handling, and modular programming techniques.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 104',
                'title' => 'Data Structures and Algorithms',
                'units' => 3.0,
                'description' => 'Study of fundamental data structures and algorithms including arrays, linked lists, stacks, queues, trees, and graphs.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 105',
                'title' => 'Object-Oriented Programming',
                'units' => 3.0,
                'description' => 'Principles of object-oriented programming: encapsulation, inheritance, polymorphism, and abstraction.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 106',
                'title' => 'Database Management Systems',
                'units' => 3.0,
                'description' => 'Concepts of database design, relational model, SQL, normalization, transactions, and database administration.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 107',
                'title' => 'Computer Networks',
                'units' => 3.0,
                'description' => 'Network architectures, protocols, OSI and TCP/IP models, LAN/WAN technologies, and network security fundamentals.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 108',
                'title' => 'Information Assurance and Security',
                'units' => 3.0,
                'description' => 'Principles of information security, cryptography, access control, network security, and ethical hacking concepts.',
                'is_active' => true,
            ],
            [
                'code' => 'COSC 109',
                'title' => 'Social Issues and Professional Practice',
                'units' => 3.0,
                'description' => 'Professional ethics, intellectual property, privacy, security, and social impact of computing technologies.',
                'is_active' => true,
            ],

            // ==========================================
            // BS COMPUTER SCIENCE (BSCS) CORE SUBJECTS
            // CHED CMO No. 25 s. 2015
            // ==========================================
            [
                'code' => 'CS 101',
                'title' => 'Discrete Mathematics',
                'units' => 3.0,
                'description' => 'Mathematical structures used in computer science: logic, sets, relations, functions, combinatorics, and graph theory.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 102',
                'title' => 'Algorithm Design and Analysis',
                'units' => 3.0,
                'description' => 'Design and analysis of algorithms including sorting, searching, dynamic programming, greedy algorithms, and complexity theory.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 103',
                'title' => 'Computer Architecture and Organization',
                'units' => 3.0,
                'description' => 'Digital logic, CPU design, memory organization, instruction sets, pipelining, and computer system components.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 104',
                'title' => 'Operating Systems',
                'units' => 3.0,
                'description' => 'Operating system principles: processes, threads, scheduling, memory management, file systems, and I/O management.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 105',
                'title' => 'Programming Languages',
                'units' => 3.0,
                'description' => 'Concepts of programming language design, syntax, semantics, parsing, and survey of language paradigms.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 106',
                'title' => 'Automata Theory and Formal Languages',
                'units' => 3.0,
                'description' => 'Finite automata, regular expressions, context-free grammars, pushdown automata, and Turing machines.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 107',
                'title' => 'Software Engineering 1',
                'units' => 3.0,
                'description' => 'Software development lifecycle, requirements engineering, software design patterns, and project management.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 108',
                'title' => 'Software Engineering 2',
                'units' => 3.0,
                'description' => 'Software testing, quality assurance, maintenance, refactoring, and advanced software architecture.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 109',
                'title' => 'Human-Computer Interaction',
                'units' => 3.0,
                'description' => 'Principles of usability, user-centered design, interface design methodologies, and evaluation of interactive systems.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 111',
                'title' => 'Thesis Writing 1',
                'units' => 3.0,
                'description' => 'Research proposal development, literature review, and preliminary investigation for the undergraduate CS thesis.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 112',
                'title' => 'Thesis Writing 2',
                'units' => 3.0,
                'description' => 'Implementation, testing, documentation, and oral defense of the undergraduate CS thesis.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 113',
                'title' => 'CS Practicum',
                'units' => 6.0,
                'description' => 'Industry immersion program where students apply computer science knowledge in real-world professional environments.',
                'is_active' => true,
            ],

            // BSCS Elective Subjects
            [
                'code' => 'CS 201',
                'title' => 'Artificial Intelligence',
                'units' => 3.0,
                'description' => 'Introduction to AI concepts: search algorithms, knowledge representation, machine learning, and natural language processing.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 202',
                'title' => 'Machine Learning',
                'units' => 3.0,
                'description' => 'Supervised and unsupervised learning, neural networks, deep learning, and applications in data analysis.',
                'is_active' => true,
            ],
            [
                'code' => 'CS 203',
                'title' => 'Computer Graphics',
                'units' => 3.0,
                'description' => 'Principles of 2D and 3D computer graphics, rendering pipeline, transformations, and graphical interface programming.',
                'is_active' => true,
            ],

            // ==========================================
            // BS INFORMATION TECHNOLOGY (BSIT) CORE SUBJECTS
            // CHED CMO No. 25 s. 2015
            // ==========================================
            [
                'code' => 'IT 101',
                'title' => 'Web Systems and Technologies 1',
                'units' => 3.0,
                'description' => 'Fundamentals of web development including HTML5, CSS3, JavaScript, and client-server architecture.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 102',
                'title' => 'Web Systems and Technologies 2',
                'units' => 3.0,
                'description' => 'Advanced web development with server-side scripting, web frameworks, RESTful APIs, and web application security.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 103',
                'title' => 'Platform Technologies',
                'units' => 3.0,
                'description' => 'Overview of hardware and software platforms including operating systems, virtualization, and cloud environments.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 104',
                'title' => 'Systems Analysis and Design',
                'units' => 3.0,
                'description' => 'Methodologies for analyzing and designing information systems, including structured and object-oriented approaches.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 105',
                'title' => 'Systems Integration and Architecture',
                'units' => 3.0,
                'description' => 'Integration of enterprise systems, service-oriented architecture, middleware, and enterprise application integration.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 106',
                'title' => 'Application Development and Emerging Technologies',
                'units' => 3.0,
                'description' => 'Development of applications using emerging technologies including IoT, AR/VR, and blockchain fundamentals.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 107',
                'title' => 'Technopreneurship',
                'units' => 3.0,
                'description' => 'Technology-based entrepreneurship, startup ecosystem, lean methodology, and IT product development strategies.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 108',
                'title' => 'Capstone Project 1',
                'units' => 3.0,
                'description' => 'Proposal, planning, and initial development of an IT capstone project addressing real-world problems.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 109',
                'title' => 'Capstone Project 2',
                'units' => 3.0,
                'description' => 'Completion, testing, documentation, and oral defense of the IT capstone project.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 110',
                'title' => 'IT Practicum',
                'units' => 6.0,
                'description' => 'Industry immersion where students apply IT knowledge and skills in real-world professional environments.',
                'is_active' => true,
            ],

            // BSIT Elective Subjects
            [
                'code' => 'IT 201',
                'title' => 'Mobile Application Development',
                'units' => 3.0,
                'description' => 'Development of mobile applications for Android and iOS platforms using modern cross-platform frameworks.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 202',
                'title' => 'Cloud Computing',
                'units' => 3.0,
                'description' => 'Cloud service models (IaaS, PaaS, SaaS), cloud providers, deployment models, and cloud-native application development.',
                'is_active' => true,
            ],
            [
                'code' => 'IT 203',
                'title' => 'DevOps and Automation',
                'units' => 3.0,
                'description' => 'DevOps culture, CI/CD pipelines, containerization with Docker, orchestration with Kubernetes, and infrastructure as code.',
                'is_active' => true,
            ],

            // ==========================================
            // MATHEMATICS AND SCIENCES
            // Primarily used by Engineering and Science programs
            // ==========================================
            [
                'code' => 'MATH 101',
                'title' => 'Calculus 1',
                'units' => 3.0,
                'description' => 'Limits, continuity, derivatives, and their applications including curve sketching and optimization.',
                'is_active' => true,
            ],
            [
                'code' => 'MATH 102',
                'title' => 'Calculus 2',
                'units' => 3.0,
                'description' => 'Integration techniques, applications of integrals, infinite sequences, and power series.',
                'is_active' => true,
            ],
            [
                'code' => 'MATH 103',
                'title' => 'Differential Equations',
                'units' => 3.0,
                'description' => 'Ordinary differential equations, methods of solution, Laplace transforms, and applications in engineering.',
                'is_active' => true,
            ],
            [
                'code' => 'MATH 104',
                'title' => 'Linear Algebra',
                'units' => 3.0,
                'description' => 'Vectors, matrices, systems of linear equations, determinants, eigenvalues, and linear transformations.',
                'is_active' => true,
            ],
            [
                'code' => 'PHYS 101',
                'title' => 'Physics for Engineers 1',
                'units' => 3.0,
                'description' => 'Mechanics, kinematics, dynamics, work, energy, momentum, rotation, and basic thermodynamics.',
                'is_active' => true,
            ],
            [
                'code' => 'PHYS 102',
                'title' => 'Physics for Engineers 2',
                'units' => 3.0,
                'description' => 'Electricity, magnetism, optics, waves, and modern physics for engineering students.',
                'is_active' => true,
            ],
            [
                'code' => 'CHEM 101',
                'title' => 'General Chemistry for Engineers',
                'units' => 3.0,
                'description' => 'Fundamental chemistry: atomic structure, chemical bonding, stoichiometry, thermochemistry, and reaction kinetics.',
                'is_active' => true,
            ],

            // ==========================================
            // ELECTRICAL ENGINEERING (EE) SUBJECTS
            // ==========================================
            [
                'code' => 'EE 101',
                'title' => 'Basic Electrical Engineering',
                'units' => 3.0,
                'description' => 'Fundamental concepts of electricity, DC and AC circuits, Kirchhoff\'s laws, and basic network theorems.',
                'is_active' => true,
            ],
            [
                'code' => 'EE 102',
                'title' => 'Circuit Theory',
                'units' => 3.0,
                'description' => 'Analysis of electrical circuits using mesh and node analysis, Thevenin, Norton, and superposition theorems.',
                'is_active' => true,
            ],
            [
                'code' => 'EE 103',
                'title' => 'Electronics 1',
                'units' => 3.0,
                'description' => 'Semiconductor devices, diodes, bipolar junction transistors, FETs, amplifiers, and basic electronic circuit analysis.',
                'is_active' => true,
            ],
            [
                'code' => 'EE 104',
                'title' => 'Electronics 2',
                'units' => 3.0,
                'description' => 'Advanced electronic circuits, operational amplifiers, feedback systems, oscillators, and digital electronics.',
                'is_active' => true,
            ],
            [
                'code' => 'EE 105',
                'title' => 'Power Systems Analysis',
                'units' => 3.0,
                'description' => 'Generation, transmission, and distribution of electrical power, per-unit system, load flow, and fault analysis.',
                'is_active' => true,
            ],
            [
                'code' => 'EE 106',
                'title' => 'Control Systems',
                'units' => 3.0,
                'description' => 'Open and closed-loop control systems, transfer functions, root locus, frequency response, and stability analysis.',
                'is_active' => true,
            ],
            [
                'code' => 'EE 107',
                'title' => 'Electrical Machines',
                'units' => 3.0,
                'description' => 'Principles and operation of transformers, DC machines, induction motors, and synchronous generators.',
                'is_active' => true,
            ],

            // ==========================================
            // CIVIL ENGINEERING (CE) SUBJECTS
            // ==========================================
            [
                'code' => 'CE 101',
                'title' => 'Engineering Mechanics - Statics',
                'units' => 3.0,
                'description' => 'Principles of statics: force systems, resultants, equilibrium, trusses, frames, and distributed forces.',
                'is_active' => true,
            ],
            [
                'code' => 'CE 102',
                'title' => 'Engineering Mechanics - Dynamics',
                'units' => 3.0,
                'description' => 'Kinematics and kinetics of particles and rigid bodies, work-energy, and impulse-momentum methods.',
                'is_active' => true,
            ],
            [
                'code' => 'CE 103',
                'title' => 'Mechanics of Deformable Bodies',
                'units' => 3.0,
                'description' => 'Stress, strain, mechanical properties of materials, axial loading, torsion, bending, and beam deflection.',
                'is_active' => true,
            ],
            [
                'code' => 'CE 104',
                'title' => 'Hydraulics and Fluid Mechanics',
                'units' => 3.0,
                'description' => 'Properties of fluids, fluid statics, Bernoulli equation, pipe flow, pump selection, and open channel hydraulics.',
                'is_active' => true,
            ],
            [
                'code' => 'CE 105',
                'title' => 'Structural Analysis',
                'units' => 3.0,
                'description' => 'Analysis of statically determinate and indeterminate structures using classical and matrix stiffness methods.',
                'is_active' => true,
            ],

            // ==========================================
            // BUSINESS ADMINISTRATION SUBJECTS
            // ==========================================
            [
                'code' => 'BA 101',
                'title' => 'Principles of Management',
                'units' => 3.0,
                'description' => 'Management functions: planning, organizing, leading, and controlling in business organizations.',
                'is_active' => true,
            ],
            [
                'code' => 'BA 102',
                'title' => 'Principles of Marketing',
                'units' => 3.0,
                'description' => 'Marketing concepts, consumer behavior, market segmentation, marketing mix, and digital marketing fundamentals.',
                'is_active' => true,
            ],
            [
                'code' => 'BA 103',
                'title' => 'Financial Management',
                'units' => 3.0,
                'description' => 'Financial analysis, time value of money, capital budgeting, cost of capital, and working capital management.',
                'is_active' => true,
            ],
            [
                'code' => 'BA 104',
                'title' => 'Operations Management',
                'units' => 3.0,
                'description' => 'Production planning, quality management, supply chain, inventory control, and process improvement techniques.',
                'is_active' => true,
            ],
            [
                'code' => 'BA 105',
                'title' => 'Business Economics',
                'units' => 3.0,
                'description' => 'Application of economic theories to business decision-making including demand, supply, and market structures.',
                'is_active' => true,
            ],
            [
                'code' => 'BA 106',
                'title' => 'Business Law',
                'units' => 3.0,
                'description' => 'Legal framework for business operations including contracts, sales, agency, and business organization laws.',
                'is_active' => true,
            ],
            [
                'code' => 'ACC 101',
                'title' => 'Financial Accounting 1',
                'units' => 3.0,
                'description' => 'Fundamentals of accounting, recording business transactions, and preparation of financial statements.',
                'is_active' => true,
            ],
            [
                'code' => 'ACC 102',
                'title' => 'Financial Accounting 2',
                'units' => 3.0,
                'description' => 'Partnership and corporation accounting, long-term assets, liabilities, and stockholders\' equity.',
                'is_active' => true,
            ],
            [
                'code' => 'ACC 103',
                'title' => 'Cost Accounting',
                'units' => 3.0,
                'description' => 'Job order, process, and standard costing systems; cost-volume-profit analysis, and cost allocation methods.',
                'is_active' => true,
            ],
            [
                'code' => 'ACC 104',
                'title' => 'Auditing Theory',
                'units' => 3.0,
                'description' => 'Principles of auditing, Philippine Standards on Auditing, internal controls, audit evidence, and audit reports.',
                'is_active' => true,
            ],

            // ==========================================
            // EDUCATION SUBJECTS
            // ==========================================
            [
                'code' => 'EDUC 101',
                'title' => 'Foundations of Education',
                'units' => 3.0,
                'description' => 'Historical, philosophical, sociological, and legal foundations of education in the Philippine context.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 102',
                'title' => 'Child and Adolescent Development',
                'units' => 3.0,
                'description' => 'Physical, cognitive, social, and emotional development of learners from childhood through adolescence.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 103',
                'title' => 'The Teacher and the Community',
                'units' => 3.0,
                'description' => 'The teacher\'s role in society, school-community relations, and professional ethics for educators.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 104',
                'title' => 'Assessment in Learning',
                'units' => 3.0,
                'description' => 'Principles and practices of classroom assessment, test construction, grading systems, and performance evaluation.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 105',
                'title' => 'Curriculum Development',
                'units' => 3.0,
                'description' => 'Curriculum design theories, implementation strategies, evaluation methods, and alignment with national standards.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 106',
                'title' => 'Field Study 1',
                'units' => 1.0,
                'description' => 'Classroom observation and analysis of learning environments in cooperating elementary or secondary schools.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 107',
                'title' => 'Field Study 2',
                'units' => 1.0,
                'description' => 'Observation and guided participation in instructional planning, delivery, and classroom management.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 108',
                'title' => 'Practice Teaching',
                'units' => 6.0,
                'description' => 'Supervised full-time teaching experience in CHED-accredited cooperating schools.',
                'is_active' => true,
            ],

            // ==========================================
            // NURSING SUBJECTS
            // CHED CMO No. 14 s. 2009 / CMO No. 15 s. 2017
            // ==========================================
            [
                'code' => 'NUR 101',
                'title' => 'Fundamentals of Nursing',
                'units' => 5.0,
                'description' => 'Basic nursing concepts, the nursing process, vital signs, asepsis, and fundamental nursing procedures.',
                'is_active' => true,
            ],
            [
                'code' => 'NUR 102',
                'title' => 'Health Assessment',
                'units' => 3.0,
                'description' => 'Systematic health history taking, physical examination techniques, and documentation of patient findings.',
                'is_active' => true,
            ],
            [
                'code' => 'NUR 103',
                'title' => 'Pharmacology',
                'units' => 3.0,
                'description' => 'Drug classifications, pharmacokinetics, pharmacodynamics, drug interactions, and safe medication administration.',
                'is_active' => true,
            ],
            [
                'code' => 'NUR 104',
                'title' => 'Medical-Surgical Nursing 1',
                'units' => 5.0,
                'description' => 'Nursing care for adult clients with medical-surgical conditions affecting the cardiovascular and respiratory systems.',
                'is_active' => true,
            ],
            [
                'code' => 'NUR 105',
                'title' => 'Community Health Nursing',
                'units' => 5.0,
                'description' => 'Public health nursing concepts, community assessment, health promotion, and family nursing care.',
                'is_active' => true,
            ],
            [
                'code' => 'NUR 106',
                'title' => 'Maternal and Newborn Nursing',
                'units' => 5.0,
                'description' => 'Nursing care during pregnancy, labor and delivery, postpartum period, and care of the newborn.',
                'is_active' => true,
            ],
            [
                'code' => 'NUR 107',
                'title' => 'Pediatric Nursing',
                'units' => 5.0,
                'description' => 'Nursing care of children from infancy through adolescence, including growth, development, and pediatric disorders.',
                'is_active' => true,
            ],
            [
                'code' => 'NUR 108',
                'title' => 'Psychiatric Nursing',
                'units' => 5.0,
                'description' => 'Mental health nursing concepts, psychiatric disorders, therapeutic communication, and mental health client care.',
                'is_active' => true,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }

        $this->command->info('Subjects seeded: ' . count($subjects) . ' WMSU subjects created.');
    }
}

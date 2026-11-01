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
                'description' => 'Nature of mathematics, appreciation of its practical, intellectual, and aesthetic dimensions, and its application in daily life.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 105',
                'title' => 'Purposive Communication',
                'units' => 3.0,
                'description' => 'Writing, speaking, and presenting to different audiences and for various purposes with multicultural awareness.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 106',
                'title' => 'Art Appreciation',
                'units' => 3.0,
                'description' => 'Develops students ability to appreciate, analyze, and critique works of art through practical and historical lenses.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 107',
                'title' => 'Science, Technology, and Society',
                'units' => 3.0,
                'description' => 'Interaction between science, technology, and society throughout history with emphasis on ethics and human flourishing.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 108',
                'title' => 'Ethics',
                'units' => 3.0,
                'description' => 'Principles of ethical behavior in modern society, moral decision making, and ethical frameworks across cultures.',
                'is_active' => true,
            ],
            [
                'code' => 'GEC 109',
                'title' => 'The Life and Works of Jose Rizal',
                'units' => 3.0,
                'description' => 'Study of the life, works, and writings of Dr. Jose Rizal pursuant to Republic Act No. 1425.',
                'is_active' => true,
            ],

            // ==========================================
            // PHYSICAL EDUCATION (PATHFIT)
            // ==========================================
            [
                'code' => 'PATHFIT 1',
                'title' => 'Movement Competency Training',
                'units' => 2.0,
                'description' => 'Fundamental movement patterns, core stability, physical fitness testing, and healthy lifestyle development.',
                'is_active' => true,
            ],
            [
                'code' => 'PATHFIT 2',
                'title' => 'Exercise-based Fitness Activities',
                'units' => 2.0,
                'description' => 'Fitness training regimens, cardiovascular conditioning, resistance training, and aerobic exercises.',
                'is_active' => true,
            ],
            [
                'code' => 'PATHFIT 3',
                'title' => 'Physical Activity towards Health and Fitness 3 (Dance & Sports)',
                'units' => 2.0,
                'description' => 'Development of individual, dual, and team sports fundamentals and recreational movement forms.',
                'is_active' => true,
            ],
            [
                'code' => 'PATHFIT 4',
                'title' => 'Physical Activity towards Health and Fitness 4 (Outdoor & Adventure)',
                'units' => 2.0,
                'description' => 'Outdoor education, recreational games, martial arts, and lifelong active living principles.',
                'is_active' => true,
            ],

            // ==========================================
            // NATIONAL SERVICE TRAINING PROGRAM (NSTP)
            // ==========================================
            [
                'code' => 'NSTP 1',
                'title' => 'National Service Training Program 1',
                'units' => 3.0,
                'description' => 'Civic consciousness, defense preparedness, disaster risk reduction, and community service literacy.',
                'is_active' => true,
            ],
            [
                'code' => 'NSTP 2',
                'title' => 'National Service Training Program 2',
                'units' => 3.0,
                'description' => 'Community immersion, participatory action projects, community outreach, and civic development implementation.',
                'is_active' => true,
            ],

            // ==========================================
            // FILIPINO MANDATED SUBJECTS
            // ==========================================
            [
                'code' => 'FIL 101',
                'title' => 'Kontekstwalisadong Komunikasyon sa Filipino',
                'units' => 3.0,
                'description' => 'Pagsasanay sa paggamit ng wikang Filipino sa iba\'t ibang konteksto at diskursong pang-akademiko.',
                'is_active' => true,
            ],
            [
                'code' => 'FIL 102',
                'title' => 'Filipino sa Iba\'t Ibang Disiplina',
                'units' => 3.0,
                'description' => 'Pagbasa at pagsulat tungo sa pananaliksik sa iba\'t ibang larangang pang-akademiko gamit ang Filipino.',
                'is_active' => true,
            ],

            // ==========================================
            // PROFESSIONAL EDUCATION CORE COURSES (EDUC)
            // CHED CMO No. 74-80 s. 2017
            // ==========================================
            [
                'code' => 'EDUC 101',
                'title' => 'The Child and Adolescent Learners and Learning Principles',
                'units' => 3.0,
                'description' => 'Developmental processes, biological, psychological, cognitive, and social development of child and adolescent learners.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 102',
                'title' => 'Facilitating Learner-Centered Teaching',
                'units' => 3.0,
                'description' => 'Learning theories, metacognition, behavioral, cognitive, constructivist theories, and motivation in teaching-learning.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 103',
                'title' => 'The Teaching Profession',
                'units' => 3.0,
                'description' => 'The teacher as a professional, Code of Ethics, teaching philosophy, historical and legal bases of Philippine education.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 104',
                'title' => 'Technology for Teaching and Learning 1',
                'units' => 3.0,
                'description' => 'ICT integration in education, instructional design models, digital citizenship, and online educational tools.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 105',
                'title' => 'Assessment in Learning 1',
                'units' => 3.0,
                'description' => 'Traditional, objective, and test-based assessment of learning outcomes, item analysis, and psychometric foundations.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 106',
                'title' => 'Assessment in Learning 2',
                'units' => 3.0,
                'description' => 'Authentic assessment, portfolio assessment, rubrics development, performance-based tasks, and affective domain evaluation.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 107',
                'title' => 'The Teacher and the School Curriculum',
                'units' => 3.0,
                'description' => 'Curriculum development processes, models, implementation, evaluation, and the K-12 Enhanced Basic Education framework.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 108',
                'title' => 'Building and Enhancing New Literacies Across the Curriculum',
                'units' => 3.0,
                'description' => 'Financial literacy, media literacy, digital literacy, eco-literacy, multicultural literacy, and social literacy.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 109',
                'title' => 'The Teacher and the Community, School Culture and Leadership',
                'units' => 3.0,
                'description' => 'School-community partnerships, school culture, teacher leadership, organizational dynamics, and educational policies.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 110',
                'title' => 'Foundations of Special and Inclusive Education',
                'units' => 3.0,
                'description' => 'Principles, policies, and practices of teaching learners with disabilities, giftedness, and diverse educational needs.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 111',
                'title' => 'Field Study 1: Observations of Teaching-Learning',
                'units' => 3.0,
                'description' => 'First experiential learning course focusing on systematic classroom observation in partner basic education schools.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 112',
                'title' => 'Field Study 2: Participation and Teaching Assistantship',
                'units' => 3.0,
                'description' => 'Second experiential learning course involving assisting resource teachers in classroom management and lesson preparation.',
                'is_active' => true,
            ],
            [
                'code' => 'EDUC 113',
                'title' => 'Teaching Internship / Practice Teaching',
                'units' => 6.0,
                'description' => 'Culminating semester-long immersion as a student teacher in accredited public and laboratory basic education schools.',
                'is_active' => true,
            ],

            // ==========================================
            // ELEMENTARY EDUCATION MAJOR SUBJECTS (EED)
            // ==========================================
            [
                'code' => 'EED 101',
                'title' => 'Teaching English in the Elementary Grades (Language Arts)',
                'units' => 3.0,
                'description' => 'Methods, materials, and pedagogical strategies for teaching listening, speaking, reading, writing, and viewing to elementary pupils.',
                'is_active' => true,
            ],
            [
                'code' => 'EED 102',
                'title' => 'Teaching Science in the Elementary Grades (Biology and Chemistry)',
                'units' => 3.0,
                'description' => 'Inquiry-based science instruction, hands-on experimentation, and pedagogical approaches for elementary science.',
                'is_active' => true,
            ],
            [
                'code' => 'EED 103',
                'title' => 'Teaching Social Studies in the Elementary Grades',
                'units' => 3.0,
                'description' => 'Content, pedagogy, and civic values education for teaching Araling Panlipunan in Philippine elementary schools.',
                'is_active' => true,
            ],
            [
                'code' => 'EED 104',
                'title' => 'Teaching Mathematics in Primary Grades',
                'units' => 3.0,
                'description' => 'Foundational mathematical concepts, numeracy development, manipulatives, and problem-solving strategies in grades 1 to 3.',
                'is_active' => true,
            ],
            [
                'code' => 'EED 105',
                'title' => 'Teaching Music, Arts, PE, and Health (MAPEH) in Elementary Grades',
                'units' => 3.0,
                'description' => 'Integration of artistic expression, musical appreciation, motor skills, and health wellness for young learners.',
                'is_active' => true,
            ],
            [
                'code' => 'EED 106',
                'title' => 'Content and Pedagogy for the Mother Tongue',
                'units' => 3.0,
                'description' => 'Mother Tongue-Based Multilingual Education (MTB-MLE) principles, orthography, and early grade literacy instruction.',
                'is_active' => true,
            ],

            // ==========================================
            // SECONDARY EDUCATION - ENGLISH MAJOR (ENG)
            // ==========================================
            [
                'code' => 'ENG 101',
                'title' => 'Introduction to Linguistics',
                'units' => 3.0,
                'description' => 'Phonetics, phonology, morphology, syntax, semantics, and sociolinguistic foundations of language.',
                'is_active' => true,
            ],
            [
                'code' => 'ENG 102',
                'title' => 'Structure of English',
                'units' => 3.0,
                'description' => 'Detailed study of English syntax, morphology, grammatical categories, sentence structures, and transformational grammar.',
                'is_active' => true,
            ],
            [
                'code' => 'ENG 103',
                'title' => 'Teaching and Assessment of Literature Studies',
                'units' => 3.0,
                'description' => 'Literary genres, pedagogical methods for literature, analytical criticism, and authentic literature assessment.',
                'is_active' => true,
            ],
            [
                'code' => 'ENG 104',
                'title' => 'Speech and Theater Arts',
                'units' => 3.0,
                'description' => 'Public speaking, oral communication, dramatic performance, stage craft, and reader\'s theater for secondary classrooms.',
                'is_active' => true,
            ],

            // ==========================================
            // SECONDARY EDUCATION - MATHEMATICS MAJOR (MATH)
            // ==========================================
            [
                'code' => 'MATH 101',
                'title' => 'History of Mathematics',
                'units' => 3.0,
                'description' => 'Historical evolution of mathematical ideas, famous mathematicians, and the cultural development of numerical systems.',
                'is_active' => true,
            ],
            [
                'code' => 'MATH 102',
                'title' => 'College and Advanced Algebra',
                'units' => 3.0,
                'description' => 'Polynomial equations, algebraic structures, rational functions, matrices, determinants, and system of equations.',
                'is_active' => true,
            ],
            [
                'code' => 'MATH 103',
                'title' => 'Plane and Solid Geometry',
                'units' => 3.0,
                'description' => 'Euclidean axiomatic system, geometric proofs, triangles, circles, polyhedra, and spatial measurement concepts.',
                'is_active' => true,
            ],
            [
                'code' => 'MATH 104',
                'title' => 'Trigonometry with Analytic Geometry',
                'units' => 3.0,
                'description' => 'Trigonometric functions, identities, conic sections, polar coordinates, and practical applied measurement.',
                'is_active' => true,
            ],

            // ==========================================
            // SECONDARY EDUCATION - SCIENCE MAJOR (SCI)
            // ==========================================
            [
                'code' => 'SCI 101',
                'title' => 'Earth and Space Science for Teachers',
                'units' => 3.0,
                'description' => 'Geology, meteorology, oceanography, astronomy, and planetary systems aligned with secondary science curricula.',
                'is_active' => true,
            ],
            [
                'code' => 'SCI 102',
                'title' => 'Inorganic Chemistry with Laboratory for Teachers',
                'units' => 4.0,
                'description' => 'Atomic structure, chemical bonding, stoichiometry, gas laws, solutions, and laboratory safety for educators.',
                'is_active' => true,
            ],
            [
                'code' => 'SCI 103',
                'title' => 'Integrated Biology with Laboratory for Teachers',
                'units' => 4.0,
                'description' => 'Cell biology, genetics, evolution, ecology, organismal diversity, and biological microscopy for secondary teachers.',
                'is_active' => true,
            ],
            [
                'code' => 'SCI 104',
                'title' => 'Mechanics, Waves, and Thermodynamics for Teachers',
                'units' => 4.0,
                'description' => 'Newtonian mechanics, work and energy, thermal physics, sound, and wave motion pedagogical experiments.',
                'is_active' => true,
            ],

            // ==========================================
            // EARLY CHILDHOOD EDUCATION (ECED)
            // ==========================================
            [
                'code' => 'ECED 101',
                'title' => 'Child Development and Learning Principles in Early Years',
                'units' => 3.0,
                'description' => 'Holistic development of young children covering cognitive, socio-emotional, physical, and language milestones.',
                'is_active' => true,
            ],
            [
                'code' => 'ECED 102',
                'title' => 'Early Childhood Curriculum and Pedagogical Models',
                'units' => 3.0,
                'description' => 'Developmentally appropriate curriculum approaches, emergent curriculum, Montessori, and Reggio Emilia frameworks.',
                'is_active' => true,
            ],
            [
                'code' => 'ECED 103',
                'title' => 'Play and Creative Learning Environments',
                'units' => 3.0,
                'description' => 'Role of play in learning, indoor and outdoor environment design, manipulatives, and sensory learning experiences.',
                'is_active' => true,
            ],
            [
                'code' => 'ECED 104',
                'title' => 'Emergent Literacy and Language Development',
                'units' => 3.0,
                'description' => 'Phonological awareness, oral language acquisition, early storytelling, and shared reading for preschoolers.',
                'is_active' => true,
            ],
            [
                'code' => 'ECED 105',
                'title' => 'Positive Guidance and Classroom Management for Young Children',
                'units' => 3.0,
                'description' => 'Child-centered behavioral guidance, routines, social-emotional competence, and supportive early learning spaces.',
                'is_active' => true,
            ],
            [
                'code' => 'ECED 106',
                'title' => 'Family, Community, and Early Care Partnerships',
                'units' => 3.0,
                'description' => 'Building collaborative relationships with families, community resources, and early childhood health programs.',
                'is_active' => true,
            ],

            // ==========================================
            // SPECIAL NEEDS EDUCATION (SNED)
            // ==========================================
            [
                'code' => 'SNED 101',
                'title' => 'Introduction to Special Needs and Inclusive Education',
                'units' => 3.0,
                'description' => 'Philosophical, historical, and legal foundations of special education and inclusive classroom practices.',
                'is_active' => true,
            ],
            [
                'code' => 'SNED 102',
                'title' => 'Assessment and Identification of Exceptional Learners',
                'units' => 3.0,
                'description' => 'Formal and informal diagnostic tools, screening procedures, and multidisciplinary evaluation in special education.',
                'is_active' => true,
            ],
            [
                'code' => 'SNED 103',
                'title' => 'Individualized Education Plan (IEP) Development and Curriculum Adaptation',
                'units' => 3.0,
                'description' => 'Designing, writing, implementing, and monitoring IEPs with tailored accommodations and universal design.',
                'is_active' => true,
            ],
            [
                'code' => 'SNED 104',
                'title' => 'Assistive Technology and Adaptive Instructional Resources',
                'units' => 3.0,
                'description' => 'Low-tech and high-tech assistive devices, augmentative communication, and software accessibility in special education.',
                'is_active' => true,
            ],
            [
                'code' => 'SNED 105',
                'title' => 'Positive Behavior Interventions and Classroom Supports (PBIS)',
                'units' => 3.0,
                'description' => 'Functional behavior assessment, proactive intervention planning, and supporting diverse emotional needs.',
                'is_active' => true,
            ],
            [
                'code' => 'SNED 106',
                'title' => 'Teaching Learners with Autism Spectrum Disorder and Intellectual Disabilities',
                'units' => 3.0,
                'description' => 'Evidence-based structured teaching, visual supports, life skills instruction, and social communication strategies.',
                'is_active' => true,
            ],

            // ==========================================
            // CULTURE AND ARTS EDUCATION (CAED)
            // ==========================================
            [
                'code' => 'CAED 101',
                'title' => 'Foundations of Philippine Arts, Culture, and Heritage',
                'units' => 3.0,
                'description' => 'Historical development of Philippine visual arts, music, dance, indigenous traditions, and Mindanao cultural heritage.',
                'is_active' => true,
            ],
            [
                'code' => 'CAED 102',
                'title' => 'Music and Movement Pedagogy in Cultural Contexts',
                'units' => 3.0,
                'description' => 'Kodály, Orff, and Dalcroze approaches integrated with ethnic Philippine musical traditions and folk movement.',
                'is_active' => true,
            ],
            [
                'code' => 'CAED 103',
                'title' => 'Visual Arts Expression, Design, and Studio Practices',
                'units' => 3.0,
                'description' => 'Drawing, painting, printmaking, sculpture, and artistic media exploration for classroom instruction.',
                'is_active' => true,
            ],
            [
                'code' => 'CAED 104',
                'title' => 'Performing Arts, Theater Arts, and Dance in Education',
                'units' => 3.0,
                'description' => 'Drama in education, creative dramatics, Philippine folk dances, choreography, and staging techniques.',
                'is_active' => true,
            ],
            [
                'code' => 'CAED 105',
                'title' => 'Traditional Crafts, Indigenous Artistry, and Folk Arts',
                'units' => 3.0,
                'description' => 'Weaving, pottery, woodcraft, eco-arts, and preservation of local cultural artisan knowledge.',
                'is_active' => true,
            ],
            [
                'code' => 'CAED 106',
                'title' => 'Arts Production, Exhibition, and Cultural Festival Management',
                'units' => 3.0,
                'description' => 'Curation, gallery presentation, school festival coordination, and community arts showcases.',
                'is_active' => true,
            ],

            // ==========================================
            // SECONDARY EDUCATION - FILIPINO MAJOR (FIL)
            // ==========================================
            [
                'code' => 'FIL 103',
                'title' => 'Estruktura ng Wikang Filipino',
                'units' => 3.0,
                'description' => 'Masusing pag-aaral ng ponolohiya, morpolohiya, at sintaksis ng wikang pambansa.',
                'is_active' => true,
            ],
            [
                'code' => 'FIL 104',
                'title' => 'Introduksyon sa Pag-aaral ng Wika',
                'units' => 3.0,
                'description' => 'Mga teorya sa pagkatuto at pagtuturo ng wika, varayti ng wika, at lingguwistikang Filipino.',
                'is_active' => true,
            ],
            [
                'code' => 'FIL 105',
                'title' => 'Panitikan ng Pilipinas',
                'units' => 3.0,
                'description' => 'Pagsusuri sa mga akdang pampanitikan mula sa iba\'t ibang rehiyon at panahon sa kasaysayan ng bansa.',
                'is_active' => true,
            ],
            [
                'code' => 'FIL 106',
                'title' => 'Pagtuturo at Pagtataya ng Panitikan',
                'units' => 3.0,
                'description' => 'Metodolohiya, kagamitang pampagtuturo, at makabagong dulog sa pagsusulit at pagtataya sa panitikan.',
                'is_active' => true,
            ],

            // ==========================================
            // SECONDARY EDUCATION - SOCIAL STUDIES MAJOR (SOCS)
            // ==========================================
            [
                'code' => 'SOCS 101',
                'title' => 'Geography and Environmental Studies for Educators',
                'units' => 3.0,
                'description' => 'Physical and human geography, cartography, climate zones, and human-environment interactions.',
                'is_active' => true,
            ],
            [
                'code' => 'SOCS 102',
                'title' => 'Asian Studies, Culture, and Regional Geopolitics',
                'units' => 3.0,
                'description' => 'History, civilization, philosophies, and contemporary economic developments in East, South, and Southeast Asia.',
                'is_active' => true,
            ],
            [
                'code' => 'SOCS 103',
                'title' => 'World History and Contemporary Civilizations',
                'units' => 3.0,
                'description' => 'Major world revolutions, political transformations, global conflicts, and inter-civilizational connections.',
                'is_active' => true,
            ],
            [
                'code' => 'SOCS 104',
                'title' => 'Socio-Cultural Anthropology and Economics for Teachers',
                'units' => 3.0,
                'description' => 'Economic theories, market dynamics, poverty alleviation, cultural systems, and social institutions.',
                'is_active' => true,
            ],

            // ==========================================
            // SECONDARY EDUCATION - VALUES EDUCATION MAJOR (VAL)
            // ==========================================
            [
                'code' => 'VAL 101',
                'title' => 'Foundations of Values Education and Human Dignity',
                'units' => 3.0,
                'description' => 'Philosophical, anthropological, and psychological foundations of values formation and personhood.',
                'is_active' => true,
            ],
            [
                'code' => 'VAL 102',
                'title' => 'Philosophical and Ethical Foundations of Morality',
                'units' => 3.0,
                'description' => 'Moral development theories of Kohlberg and Gilligan, ethical systems, and moral dilemma resolution.',
                'is_active' => true,
            ],
            [
                'code' => 'VAL 103',
                'title' => 'Facilitating Self-Worth and Personal Integrity',
                'units' => 3.0,
                'description' => 'Intrapersonal dynamics, self-awareness, emotional intelligence, and interpersonal relationship building.',
                'is_active' => true,
            ],
            [
                'code' => 'VAL 104',
                'title' => 'Community Outreach, Peace Education, and Global Citizenship',
                'units' => 3.0,
                'description' => 'Conflict resolution, peace-building, interfaith dialogue, social justice, and civic transformation.',
                'is_active' => true,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }

        $this->command->info('Subjects seeded: '.count($subjects).' College of Education and GenEd courses.');
    }
}

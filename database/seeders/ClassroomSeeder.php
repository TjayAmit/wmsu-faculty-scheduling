<?php

namespace Database\Seeders;

use App\Models\Classroom;
use Illuminate\Database\Seeder;

class ClassroomSeeder extends Seeder
{
    public function run(): void
    {
        $classrooms = [
            // ==========================================
            // CCS BUILDING (College of Computing Studies)
            // ==========================================
            ['building' => 'CCS Building', 'room_number' => '101', 'room_name' => 'CCS Lecture Room 1', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],
            ['building' => 'CCS Building', 'room_number' => '102', 'room_name' => 'CCS Lecture Room 2', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],
            ['building' => 'CCS Building', 'room_number' => '103', 'room_name' => 'CCS Lecture Room 3', 'capacity' => 35, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'CCS Building', 'room_number' => '201', 'room_name' => 'Computer Lab 1', 'capacity' => 40, 'room_type' => 'lab', 'equipment' => ['computers', 'projector', 'air_conditioning', 'local_area_network'], 'is_active' => true],
            ['building' => 'CCS Building', 'room_number' => '202', 'room_name' => 'Computer Lab 2', 'capacity' => 40, 'room_type' => 'lab', 'equipment' => ['computers', 'projector', 'air_conditioning', 'local_area_network'], 'is_active' => true],
            ['building' => 'CCS Building', 'room_number' => '203', 'room_name' => 'Networking Lab', 'capacity' => 30, 'room_type' => 'lab', 'equipment' => ['computers', 'network_equipment', 'projector', 'air_conditioning'], 'is_active' => true],
            ['building' => 'CCS Building', 'room_number' => '204', 'room_name' => 'Software Dev Lab', 'capacity' => 35, 'room_type' => 'lab', 'equipment' => ['computers', 'projector', 'air_conditioning', 'local_area_network'], 'is_active' => true],
            ['building' => 'CCS Building', 'room_number' => '301', 'room_name' => 'CCS Seminar Room', 'capacity' => 50, 'room_type' => 'lecture_hall', 'equipment' => ['projector', 'whiteboard', 'air_conditioning', 'sound_system'], 'is_active' => true],

            // ==========================================
            // ENGINEERING BUILDING (College of Engineering)
            // ==========================================
            ['building' => 'Engineering Building', 'room_number' => '101', 'room_name' => 'Eng Lecture Room 1', 'capacity' => 45, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Engineering Building', 'room_number' => '102', 'room_name' => 'Eng Lecture Room 2', 'capacity' => 45, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Engineering Building', 'room_number' => '103', 'room_name' => 'Eng Lecture Room 3', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Engineering Building', 'room_number' => '201', 'room_name' => 'Electrical Lab', 'capacity' => 30, 'room_type' => 'lab', 'equipment' => ['laboratory_equipment', 'projector', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Engineering Building', 'room_number' => '202', 'room_name' => 'Electronics Lab', 'capacity' => 30, 'room_type' => 'lab', 'equipment' => ['laboratory_equipment', 'oscilloscopes', 'projector'], 'is_active' => true],
            ['building' => 'Engineering Building', 'room_number' => '301', 'room_name' => 'Hydraulics Lab', 'capacity' => 25, 'room_type' => 'lab', 'equipment' => ['laboratory_equipment', 'whiteboard'], 'is_active' => true],
            ['building' => 'Engineering Building', 'room_number' => '302', 'room_name' => 'Engineering Drawing Room', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['drafting_tables', 'whiteboard'], 'is_active' => true],
            ['building' => 'Engineering Building', 'room_number' => 'AUD', 'room_name' => 'Engineering Auditorium', 'capacity' => 150, 'room_type' => 'lecture_hall', 'equipment' => ['projector', 'sound_system', 'air_conditioning'], 'is_active' => true],

            // ==========================================
            // MAIN BUILDING (General Use)
            // ==========================================
            ['building' => 'Main Building', 'room_number' => '101', 'room_name' => 'Main Lecture Hall A', 'capacity' => 60, 'room_type' => 'lecture_hall', 'equipment' => ['projector', 'whiteboard', 'air_conditioning', 'sound_system'], 'is_active' => true],
            ['building' => 'Main Building', 'room_number' => '102', 'room_name' => 'Main Lecture Hall B', 'capacity' => 60, 'room_type' => 'lecture_hall', 'equipment' => ['projector', 'whiteboard', 'air_conditioning', 'sound_system'], 'is_active' => true],
            ['building' => 'Main Building', 'room_number' => '201', 'room_name' => 'Classroom 201', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Main Building', 'room_number' => '202', 'room_name' => 'Classroom 202', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Main Building', 'room_number' => '203', 'room_name' => 'Classroom 203', 'capacity' => 35, 'room_type' => 'classroom', 'equipment' => ['whiteboard'], 'is_active' => true],
            ['building' => 'Main Building', 'room_number' => '204', 'room_name' => 'Classroom 204', 'capacity' => 35, 'room_type' => 'classroom', 'equipment' => ['whiteboard'], 'is_active' => true],
            ['building' => 'Main Building', 'room_number' => '301', 'room_name' => 'Classroom 301', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Main Building', 'room_number' => '302', 'room_name' => 'Classroom 302', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],

            // ==========================================
            // SCIENCE BUILDING (CAS)
            // ==========================================
            ['building' => 'Science Building', 'room_number' => '101', 'room_name' => 'Science Lecture Room 1', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Science Building', 'room_number' => '102', 'room_name' => 'Science Lecture Room 2', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Science Building', 'room_number' => '201', 'room_name' => 'Chemistry Lab', 'capacity' => 30, 'room_type' => 'lab', 'equipment' => ['laboratory_equipment', 'fume_hood', 'whiteboard'], 'is_active' => true],
            ['building' => 'Science Building', 'room_number' => '202', 'room_name' => 'Physics Lab', 'capacity' => 30, 'room_type' => 'lab', 'equipment' => ['laboratory_equipment', 'projector'], 'is_active' => true],
            ['building' => 'Science Building', 'room_number' => '203', 'room_name' => 'Biology Lab', 'capacity' => 30, 'room_type' => 'lab', 'equipment' => ['microscopes', 'laboratory_equipment', 'whiteboard'], 'is_active' => true],

            // ==========================================
            // BUSINESS BUILDING (CBA)
            // ==========================================
            ['building' => 'Business Building', 'room_number' => '101', 'room_name' => 'Business Classroom 1', 'capacity' => 45, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Business Building', 'room_number' => '102', 'room_name' => 'Business Classroom 2', 'capacity' => 45, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Business Building', 'room_number' => '201', 'room_name' => 'Accounting Lab', 'capacity' => 35, 'room_type' => 'lab', 'equipment' => ['computers', 'projector', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Business Building', 'room_number' => '202', 'room_name' => 'Business Conference Room', 'capacity' => 30, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],

            // ==========================================
            // EDUCATION BUILDING (COEd)
            // ==========================================
            ['building' => 'Education Building', 'room_number' => '101', 'room_name' => 'Education Classroom 1', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Education Building', 'room_number' => '102', 'room_name' => 'Education Classroom 2', 'capacity' => 40, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard'], 'is_active' => true],
            ['building' => 'Education Building', 'room_number' => '201', 'room_name' => 'Micro-Teaching Lab', 'capacity' => 25, 'room_type' => 'lab', 'equipment' => ['cameras', 'projector', 'air_conditioning'], 'is_active' => true],

            // ==========================================
            // NURSING BUILDING (CON)
            // ==========================================
            ['building' => 'Nursing Building', 'room_number' => '101', 'room_name' => 'Nursing Lecture Room 1', 'capacity' => 50, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Nursing Building', 'room_number' => '102', 'room_name' => 'Nursing Lecture Room 2', 'capacity' => 50, 'room_type' => 'classroom', 'equipment' => ['projector', 'whiteboard', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Nursing Building', 'room_number' => '201', 'room_name' => 'Nursing Skills Lab', 'capacity' => 30, 'room_type' => 'lab', 'equipment' => ['hospital_beds', 'mannequins', 'projector', 'air_conditioning'], 'is_active' => true],
            ['building' => 'Nursing Building', 'room_number' => '202', 'room_name' => 'Simulation Lab', 'capacity' => 20, 'room_type' => 'lab', 'equipment' => ['simulation_equipment', 'computers', 'projector', 'air_conditioning'], 'is_active' => true],
        ];

        foreach ($classrooms as $classroom) {
            Classroom::firstOrCreate(
                [
                    'building' => $classroom['building'],
                    'room_number' => $classroom['room_number'],
                ],
                $classroom
            );
        }

        $this->command->info('Classrooms seeded: '.count($classrooms).' WMSU rooms across '.count(array_unique(array_column($classrooms, 'building'))).' buildings.');
    }
}
